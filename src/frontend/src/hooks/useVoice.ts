import { useCallback, useEffect, useRef } from "react";

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

export interface UseVoiceOptions {
  onTranscript: (text: string, isFinal: boolean) => void;
  onListeningChange: (listening: boolean) => void;
  onSpeakingChange: (speaking: boolean) => void;
  onError?: (error: string) => void;
}

export function useVoice({
  onTranscript,
  onListeningChange,
  onSpeakingChange,
  onError,
}: UseVoiceOptions) {
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const isListeningRef = useRef(false);

  useEffect(() => {
    const SpeechRecognitionCtor =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (SpeechRecognitionCtor) {
      const recognition = new SpeechRecognitionCtor();
      recognition.lang = "hi-IN";
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        isListeningRef.current = true;
        onListeningChange(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const result = event.results[event.results.length - 1];
        const transcript = result[0].transcript;
        const isFinal = result.isFinal;
        onTranscript(transcript, isFinal);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        isListeningRef.current = false;
        onListeningChange(false);
        if (event.error !== "aborted" && event.error !== "no-speech") {
          onError?.(event.error);
        }
      };

      recognition.onend = () => {
        isListeningRef.current = false;
        onListeningChange(false);
      };

      recognitionRef.current = recognition;
    }

    synthRef.current = window.speechSynthesis;

    return () => {
      recognitionRef.current?.abort();
      synthRef.current?.cancel();
    };
  }, [onTranscript, onListeningChange, onError]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      onError?.("आपके ब्राउज़र में वॉइस रिकग्निशन समर्थित नहीं है।");
      return;
    }
    if (isListeningRef.current) return;
    try {
      recognitionRef.current.start();
    } catch {
      onError?.("माइक्रोफ़ोन शुरू करने में समस्या हुई।");
    }
  }, [onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListeningRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!synthRef.current) return;
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "hi-IN";
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => onSpeakingChange(true);
      utterance.onend = () => onSpeakingChange(false);
      utterance.onerror = () => onSpeakingChange(false);

      // Pick a Hindi voice if available
      const voices = synthRef.current.getVoices();
      const hindiVoice = voices.find((v) => v.lang.startsWith("hi"));
      if (hindiVoice) utterance.voice = hindiVoice;

      synthRef.current.speak(utterance);
    },
    [onSpeakingChange],
  );

  const stopSpeaking = useCallback(() => {
    synthRef.current?.cancel();
    onSpeakingChange(false);
  }, [onSpeakingChange]);

  const isSupported = Boolean(
    typeof window !== "undefined" &&
      (window.SpeechRecognition ?? window.webkitSpeechRecognition),
  );

  return { startListening, stopListening, speak, stopSpeaking, isSupported };
}
