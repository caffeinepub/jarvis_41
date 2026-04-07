export interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: number;
}

export interface UserProfile {
  name: string;
}

export interface JarvisState {
  messages: Message[];
  isListening: boolean;
  isSpeaking: boolean;
  isLoading: boolean;
  userName: string;
}

export interface VoiceConfig {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
}

export type ChatResult = { ok: string } | { err: string };
