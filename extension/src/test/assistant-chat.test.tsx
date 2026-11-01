import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AssistantChat } from '../sidepanel/components/AssistantChat';
import { ApiService } from '../utils/api';

class MockSpeechRecognition {
  continuous = false;
  interimResults = false;
  lang = '';
  onstart: (() => void) | null = null;
  onresult: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  onend: (() => void) | null = null;

  start = vi.fn(() => {
    if (this.onstart) this.onstart();
  });

  stop = vi.fn(() => {
    if (this.onend) this.onend();
  });

  abort = vi.fn(() => {
    if (this.onend) this.onend();
  });
}

class MockSpeechSynthesisUtterance {
  text: string;
  lang = '';
  onend: (() => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  constructor(text: string) {
    this.text = text;
  }
}

describe('AssistantChat Speech-to-Text & Text-to-Speech', () => {
  let originalSpeechRecognition: any;
  let originalSpeechSynthesis: any;
  let originalSpeechSynthesisUtterance: any;
  let mockRecognitionInstance: MockSpeechRecognition | null = null;
  let mockSpeechSynthesis: any;

  beforeEach(() => {
    originalSpeechRecognition = (window as any).SpeechRecognition;
    originalSpeechSynthesis = (window as any).speechSynthesis;
    originalSpeechSynthesisUtterance = (window as any).SpeechSynthesisUtterance;

    mockRecognitionInstance = null;
    const MockRecognitionConstructor = vi.fn(function () {
      mockRecognitionInstance = new MockSpeechRecognition();
      return mockRecognitionInstance;
    });

    (window as any).SpeechRecognition = MockRecognitionConstructor;

    mockSpeechSynthesis = {
      speak: vi.fn(),
      cancel: vi.fn(),
      paused: false,
      speaking: false
    };
    (window as any).speechSynthesis = mockSpeechSynthesis;
    (window as any).SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;

    vi.spyOn(ApiService, 'chat').mockResolvedValue({
      reply: 'Here is how to complete this step.',
      action: null,
      field_id: 'email_field',
      field_label: 'Email'
    } as any);
  });

  afterEach(() => {
    (window as any).SpeechRecognition = originalSpeechRecognition;
    (window as any).speechSynthesis = originalSpeechSynthesis;
    (window as any).SpeechSynthesisUtterance = originalSpeechSynthesisUtterance;
    vi.restoreAllMocks();
  });

  it('renders microphone button and initiates SpeechRecognition on click', () => {
    render(
      <AssistantChat
        scanResult={null}
        onScrollToField={() => {}}
        onApplyFix={() => {}}
      />
    );

    const micBtn = screen.getByTitle('Voice input (Speech to Text)');
    expect(micBtn).toBeInTheDocument();

    act(() => {
      fireEvent.click(micBtn);
    });

    expect(mockRecognitionInstance).not.toBeNull();
    expect(mockRecognitionInstance!.start).toHaveBeenCalled();
    expect(screen.getByText(/Listening... Speak now/i)).toBeInTheDocument();
  });

  it('populates transcribed speech into the input field for user review without auto-sending', async () => {
    render(
      <AssistantChat
        scanResult={null}
        onScrollToField={() => {}}
        onApplyFix={() => {}}
      />
    );

    const micBtn = screen.getByTitle('Voice input (Speech to Text)');
    act(() => {
      fireEvent.click(micBtn);
    });

    const input = screen.getByPlaceholderText(/speech will appear here for review/i) as HTMLInputElement;

    // Simulate speech recognition result event
    act(() => {
      if (mockRecognitionInstance?.onresult) {
        mockRecognitionInstance.onresult({
          resultIndex: 0,
          results: [
            [{ transcript: 'How do I fill the address field?' }]
          ]
        });
      }
    });

    // The text should be placed in input for review
    expect(input.value).toBe('How do I fill the address field?');
    // Assistant API should NOT have been called yet
    expect(ApiService.chat).not.toHaveBeenCalled();

    // User can edit the text before sending
    act(() => {
      fireEvent.change(input, { target: { value: 'How do I fill the permanent address field?' } });
    });
    expect(input.value).toBe('How do I fill the permanent address field?');

    // User sends the message
    const sendBtn = screen.getByTitle('Send message');
    await act(async () => {
      fireEvent.click(sendBtn);
    });

    expect(ApiService.chat).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'How do I fill the permanent address field?'
      })
    );
  });

  it('handles microphone permission denial error gracefully', () => {
    render(
      <AssistantChat
        scanResult={null}
        onScrollToField={() => {}}
        onApplyFix={() => {}}
      />
    );

    const micBtn = screen.getByTitle('Voice input (Speech to Text)');
    act(() => {
      fireEvent.click(micBtn);
    });

    // Simulate permission denied error
    act(() => {
      if (mockRecognitionInstance?.onerror) {
        mockRecognitionInstance.onerror({ error: 'not-allowed' });
      }
    });

    expect(
      screen.getByText(/Microphone permission was denied. Please allow microphone access/i)
    ).toBeInTheDocument();
  });

  it('handles unsupported browser for speech recognition', () => {
    delete (window as any).SpeechRecognition;
    delete (window as any).webkitSpeechRecognition;

    render(
      <AssistantChat
        scanResult={null}
        onScrollToField={() => {}}
        onApplyFix={() => {}}
      />
    );

    const micBtn = screen.getByTitle('Speech recognition is not supported in this browser');
    expect(micBtn).toBeInTheDocument();
    expect(micBtn).toHaveClass('opacity-50');

    act(() => {
      fireEvent.click(micBtn);
    });
    expect(
      screen.getByText(/Speech recognition is not supported in this browser/i)
    ).toBeInTheDocument();
  });

  it('reads assistant response aloud using speechSynthesis and shows stop button', () => {
    render(
      <AssistantChat
        scanResult={null}
        onScrollToField={() => {}}
        onApplyFix={() => {}}
      />
    );

    // Find speaker button on initial assistant message
    const speakBtn = screen.getByTitle('Read response aloud');
    expect(speakBtn).toBeInTheDocument();

    act(() => {
      fireEvent.click(speakBtn);
    });

    expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
    const calledUtterance = mockSpeechSynthesis.speak.mock.calls[0][0];
    expect(calledUtterance.text).toContain("Hello! I'm CarryON AI.");

    // While speaking, the button should show Stop reading
    expect(screen.getByTitle('Stop reading aloud')).toBeInTheDocument();
    expect(screen.getByText('Stop reading')).toBeInTheDocument();

    // Clicking stop should cancel speech synthesis
    const stopBtn = screen.getByTitle('Stop reading aloud');
    act(() => {
      fireEvent.click(stopBtn);
    });

    expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
    expect(screen.getByTitle('Read response aloud')).toBeInTheDocument();
  });

  it('resets speak button state when utterance onend fires', () => {
    render(
      <AssistantChat
        scanResult={null}
        onScrollToField={() => {}}
        onApplyFix={() => {}}
      />
    );

    const speakBtn = screen.getByTitle('Read response aloud');
    act(() => {
      fireEvent.click(speakBtn);
    });

    const calledUtterance = mockSpeechSynthesis.speak.mock.calls[0][0];

    act(() => {
      if (calledUtterance.onend) {
        calledUtterance.onend();
      }
    });

    expect(screen.getByTitle('Read response aloud')).toBeInTheDocument();
  });

  it('handles unsupported browser for speechSynthesis', () => {
    delete (window as any).speechSynthesis;

    render(
      <AssistantChat
        scanResult={null}
        onScrollToField={() => {}}
        onApplyFix={() => {}}
      />
    );

    const speakBtn = screen.getByTitle('Text-to-speech not supported in this browser');
    expect(speakBtn).toBeInTheDocument();
    expect(speakBtn).toBeDisabled();
  });
});
