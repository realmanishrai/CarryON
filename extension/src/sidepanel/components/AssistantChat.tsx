import React, { useState } from 'react';
import { Send, Bot, User, Sparkles, ArrowRight, Eye } from 'lucide-react';
import { PageScanResult } from '../../shared/types';
import { ApiService } from '../../utils/api';

interface AssistantChatProps {
  scanResult: PageScanResult | null;
  onScrollToField: (fieldId: string) => void;
  onApplyFix: (fieldId: string, value: string) => Promise<any>;
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
  actionStatus?: string;
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

  const applySuggestedFix = async (messageId: string, fieldId: string, value: string) => {
    try {
      const result = await onApplyFix(fieldId, value);
      const results = result?.results;
      const succeeded = Array.isArray(results)
        ? results.length > 0 && results.every((item: any) => item.success)
        : result?.success === true;
      setMessages((current) => current.map((message) => message.id === messageId
        ? { ...message, actionStatus: succeeded ? 'Fix applied and verified.' : 'Could not apply fix to the page.' }
        : message));
    } catch (error: any) {
      setMessages((current) => current.map((message) => message.id === messageId
        ? { ...message, actionStatus: `Could not apply fix: ${error.message}` }
        : message));
    }
  };

  const starterPrompts = [
    'Explain phone number field',
    'What does notice period mean?',
    'Check my application for errors',
    'Find missing required fields'
  ];

  const handleSend = async (userText: string) => {
    if (!userText.trim() || isLoading) return;

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
                      onClick={() => applySuggestedFix(m.id, m.suggestedAction!.field_id!, m.suggestedAction!.value!)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#22C55E]/20 text-[#22C55E] hover:bg-[#22C55E]/30 border border-[#22C55E]/30 text-[11px] font-medium transition-colors"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{m.actionStatus || `Apply Fix: "${m.suggestedAction.value}"`}</span>
                    </button>
                  )}
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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputText);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask anything about the page or any field..."
            className="flex-1 bg-[#0B0D12] border border-[#293244] rounded-lg px-3 py-2 text-xs text-[#F3F4F6] placeholder-[#64748B] focus:outline-none focus:border-[#8B7CFF]"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2 rounded-lg bg-[#8B7CFF] hover:bg-[#7A6AE6] text-white disabled:opacity-40 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
