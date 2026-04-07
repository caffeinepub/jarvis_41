import { useCallback, useState } from "react";
import type { JarvisState, Message } from "../types";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useJarvis(): JarvisState & {
  addMessage: (role: "user" | "assistant", text: string) => void;
  clearMessages: () => void;
  setIsListening: (v: boolean) => void;
  setIsSpeaking: (v: boolean) => void;
  setIsLoading: (v: boolean) => void;
  setUserName: (name: string) => void;
} {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: generateId(),
      role: "assistant",
      text: "नमस्ते! मैं जार्विस हूं। आप मुझसे कुछ भी पूछ सकते हैं। माइक्रोफ़ोन बटन दबाएं और बोलें।",
      timestamp: Date.now(),
    },
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem("jarvis_user_name") ?? "";
  });

  const addMessage = useCallback((role: "user" | "assistant", text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: generateId(), role, text, timestamp: Date.now() },
    ]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: generateId(),
        role: "assistant",
        text: "बातचीत साफ़ हो गई। मैं फिर से तैयार हूं!",
        timestamp: Date.now(),
      },
    ]);
  }, []);

  const handleSetUserName = useCallback((name: string) => {
    setUserName(name);
    localStorage.setItem("jarvis_user_name", name);
  }, []);

  return {
    messages,
    isListening,
    isSpeaking,
    isLoading,
    userName,
    addMessage,
    clearMessages,
    setIsListening,
    setIsSpeaking,
    setIsLoading,
    setUserName: handleSetUserName,
  };
}
