import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Eye, Mic, MicOff, Volume2, Square } from 'lucide-react';
import { PageScanResult } from '../../shared/types';
import { ApiService } from '../../utils/api';

interface AssistantChatProps {
  scanResult: PageScanResult | null;
  onScrollToField: (fieldId: string) => void;
  onApplyFix: (fieldId: string, value: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  fieldId?: string;
  fieldLabel?: string;
  suggestedAction?: {
    action: string;
    field_id?: string;
    value?: string;
    label?: string;
  };
}

export const AssistantChat: React.FC<AssistantChatProps> = ({
  scanResult,
  onScrollToField,
  onApplyFix
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: "Hello! I'm CarryON AI. I can explain any form field, help fix validation errors, and guide you through completing this application. What would you like to know?"
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Speech-to-Text states
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const baseTextRef = useRef<string>('');

  // Text-to-Speech states
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const isSpeechRecognitionSupported =
    typeof window !== 'undefined' &&
    Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  const isSpeechSynthesisSupported =
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof (window as any).SpeechSynthesisUtterance !== 'undefined';

  // Cleanup speech synthesis and recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch (_) {}
      }
    };
  }, []);

  const starterPrompts = [
    'Explain phone number field',
    'What does notice period mean?',
    'Check my application for errors',
    'Find missing required fields'
  ];

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }
    setSpeakingMessageId(null);
  };

  const handleSpeak = (messageId: string, text: string) => {
    if (!isSpeechSynthesisSupported) return;

    // If already reading this message, stop reading
    if (speakingMessageId === messageId) {
      stopSpeaking();
      return;
    }

    // Cancel any ongoing speech before starting a new one
    stopSpeaking();

    try {
      const utterance = new (window as any).SpeechSynthesisUtterance(text);
      utterance.lang = navigator.language || 'en-US';

      utterance.onend = () => {
        setSpeakingMessageId((current) => (current === messageId ? null : current));
      };

      utterance.onerror = (event: any) => {
        console.warn('Speech synthesis error:', event);
        setSpeakingMessageId((current) => (current === messageId ? null : current));
      };

      setSpeakingMessageId(messageId);
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis failed:', err);
      setSpeakingMessageId(null);
    }
  };

  const toggleListening = () => {
    if (!isSpeechRecognitionSupported) {
      setSpeechError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
      setIsListening(false);
      return;
    }

    // Stop reading response if active
    stopSpeaking();
    setSpeechError(null);

    try {
      const SpeechRecognitionConstructor =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognitionConstructor();
      recognitionRef.current = recognition;

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = navigator.language || 'en-US';

      baseTextRef.current = inputText ? (inputText.endsWith(' ') ? inputText : inputText + ' ') : '';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        // Let user review the transcribed text in the input box before sending
        setInputText(baseTextRef.current + transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setSpeechError('Microphone permission was denied. Please allow microphone access in your browser settings.');
        } else if (event.error === 'no-speech') {
          setSpeechError('No speech was detected. Please try again.');
        } else if (event.error === 'network') {
          setSpeechError('Network error occurred during speech recognition.');
        } else if (event.error !== 'aborted') {
          setSpeechError(`Speech recognition error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err: any) {
      setSpeechError(err?.message || 'Could not start speech recognition.');
      setIsListening(false);
    }
  };

  const handleSend = async (userText: string) => {
    if (!userText.trim() || isLoading) return;

    // Stop voice recognition or audio speech if active
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      setIsListening(false);
    }
    stopSpeaking();

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: userText
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInputText('');
    setIsLoading(true);

    try {
      // Build conversation history for context
      const historyPayload = updatedHistory.slice(-6).map((m) => ({
        role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.text
      }));

      // Call AI Chat API with webpage context
      const chatRes = await ApiService.chat({
        message: userText,
        history: historyPayload,
        page_url: scanResult?.url || window.location.href,
        page_title: scanResult?.title || document.title,
        current_step: scanResult?.currentStep || 1,
        fields: scanResult?.fields || [],
        detected_errors: scanResult?.errors || []
      });

      let actionPayload: any = null;
      if (chatRes.action) {
        actionPayload = {
          action: chatRes.action.action,
          field_id: chatRes.action.field_id,
          value: chatRes.action.suggested_value,
          label: chatRes.action.message || (chatRes.field_label ? `Focus ${chatRes.field_label}` : 'Locate Field')
        };
      } else if (chatRes.field_id) {
        actionPayload = {
          action: 'scroll_to_field',
          field_id: chatRes.field_id,
          label: chatRes.field_label ? `Locate ${chatRes.field_label}` : `Focus Field`
        };
      }

      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: 'assistant',
          text: chatRes.reply,
          fieldId: chatRes.field_id,
          fieldLabel: chatRes.field_label,
          suggestedAction: actionPayload
        }
      ]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: 'assistant',
          text: `I'm having trouble connecting to the AI backend (${e.message}). Please verify the backend is running at http://127.0.0.1:8000.`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[480px]">
      {/* Starter Prompts */}
      <div className="p-3 border-b border-[#293244] bg-[#121620]">
        <div className="text-[11px] font-medium text-[#9CA3AF] mb-1.5 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#8B7CFF]" />
          <span>Quick Prompts</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {starterPrompts.map((p) => (
            <button
              key={p}
              onClick={() => handleSend(p)}
              disabled={isLoading}
              className="text-[11px] px-2.5 py-1 rounded-full bg-[#191F2B] hover:bg-[#293244] text-[#D1D5DB] border border-[#293244] transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2 ${
              m.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {m.sender === 'assistant' && (
              <div className="w-6 h-6 rounded-md bg-[#8B7CFF]/20 border border-[#8B7CFF]/30 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-[#8B7CFF]" />
              </div>
            )}

            <div
              className={`max-w-[85%] p-2.5 rounded-lg text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-[#8B7CFF] text-white rounded-br-none'
                  : 'bg-[#191F2B] text-[#E5E7EB] border border-[#293244] rounded-bl-none'
              }`}
            >
              <div className="whitespace-pre-line">{m.text}</div>

              {m.suggestedAction && (
                <div className="mt-2 pt-2 border-t border-[#293244]/80 flex flex-wrap gap-2">
                  {m.suggestedAction.field_id && (
                    <button
                      onClick={() => onScrollToField(m.suggestedAction!.field_id!)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#8B7CFF]/20 text-[#8B7CFF] hover:bg-[#8B7CFF]/30 border border-[#8B7CFF]/30 text-[11px] font-medium transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      <span>{m.suggestedAction.label || 'Locate in Page'}</span>
                    </button>
                  )}
                  {m.suggestedAction.action === 'suggest_correction' && m.suggestedAction.value && m.suggestedAction.field_id && (
                    <button
                      onClick={() => onApplyFix(m.suggestedAction!.field_id!, m.suggestedAction!.value!)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#22C55E]/20 text-[#22C55E] hover:bg-[#22C55E]/30 border border-[#22C55E]/30 text-[11px] font-medium transition-colors"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Apply Fix: "{m.suggestedAction.value}"</span>
                    </button>
                  )}
                </div>
              )}

              {/* Text-to-Speech Speaker Button for Assistant Responses */}
              {m.sender === 'assistant' && (
                <div className="mt-2 pt-1.5 border-t border-[#293244]/60 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleSpeak(m.id, m.text)}
                    disabled={!isSpeechSynthesisSupported}
                    title={
                      !isSpeechSynthesisSupported
                        ? 'Text-to-speech not supported in this browser'
                        : speakingMessageId === m.id
                        ? 'Stop reading aloud'
                        : 'Read response aloud'
                    }
                    aria-label={
                      !isSpeechSynthesisSupported
                        ? 'Text-to-speech not supported'
                        : speakingMessageId === m.id
                        ? 'Stop reading response aloud'
                        : 'Read response aloud'
                    }
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      !isSpeechSynthesisSupported
                        ? 'opacity-40 cursor-not-allowed text-[#64748B]'
                        : speakingMessageId === m.id
                        ? 'bg-[#EF4444]/20 text-[#F87171] hover:bg-[#EF4444]/30 border border-[#EF4444]/30'
                        : 'text-[#9CA3AF] hover:text-[#E5E7EB] hover:bg-[#293244]/50'
                    }`}
                  >
                    {speakingMessageId === m.id ? (
                      <>
                        <Square className="w-3 h-3 fill-current" />
                        <span>Stop reading</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3 h-3" />
                        <span>Read aloud</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {m.sender === 'user' && (
              <div className="w-6 h-6 rounded-md bg-[#293244] flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5 text-[#9CA3AF]" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-[#9CA3AF] p-2 bg-[#121620] rounded-lg border border-[#293244]">
            <Bot className="w-4 h-4 text-[#8B7CFF] animate-spin" />
            <span>CarryON is thinking...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="p-3 bg-[#121620] border-t border-[#293244]">
        {/* Speech Recognition Error Banner */}
        {speechError && (
          <div className="text-[11px] text-[#F87171] bg-[#EF4444]/10 border border-[#EF4444]/30 px-2.5 py-1.5 rounded-lg flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5">
              <MicOff className="w-3.5 h-3.5 shrink-0 text-[#F87171]" />
              <span>{speechError}</span>
            </span>
            <button
              type="button"
              onClick={() => setSpeechError(null)}
              className="text-[#9CA3AF] hover:text-white text-xs px-1 font-bold"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {/* Active Speech Recognition Banner */}
        {isListening && (
          <div className="text-[11px] text-[#A78BFA] bg-[#8B7CFF]/10 border border-[#8B7CFF]/30 px-2.5 py-1.5 rounded-lg flex items-center justify-between mb-2 animate-pulse">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EF4444] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#EF4444]"></span>
              </span>
              <span>Listening... Speak now, then review your text below before sending.</span>
            </div>
            <button
              type="button"
              onClick={toggleListening}
              className="text-[10px] text-[#EF4444] hover:underline font-medium"
            >
              Stop
            </button>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputText);
          }}
          className="flex items-center gap-2"
        >
          {/* Microphone Button (Speech-to-Text) */}
          <button
            type="button"
            onClick={toggleListening}
            disabled={isLoading}
            title={
              !isSpeechRecognitionSupported
                ? 'Speech recognition is not supported in this browser'
                : isListening
                ? 'Stop listening'
                : 'Voice input (Speech to Text)'
            }
            aria-label={
              !isSpeechRecognitionSupported
                ? 'Speech recognition unsupported'
                : isListening
                ? 'Stop voice input'
                : 'Start voice input'
            }
            className={`p-2 rounded-lg transition-colors border ${
              !isSpeechRecognitionSupported
                ? 'bg-[#191F2B] text-[#64748B] border-[#293244] opacity-50 cursor-not-allowed'
                : isListening
                ? 'bg-[#EF4444] text-white border-[#EF4444] animate-pulse'
                : 'bg-[#191F2B] hover:bg-[#293244] text-[#9CA3AF] hover:text-[#F3F4F6] border-[#293244]'
            }`}
          >
            {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isListening
                ? 'Listening... speech will appear here for review'
                : 'Ask anything about the page or any field...'
            }
            className="flex-1 bg-[#0B0D12] border border-[#293244] rounded-lg px-3 py-2 text-xs text-[#F3F4F6] placeholder-[#64748B] focus:outline-none focus:border-[#8B7CFF]"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2 rounded-lg bg-[#8B7CFF] hover:bg-[#7A6AE6] text-white disabled:opacity-40 transition-colors"
            title="Send message"
            aria-label="Send message"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
