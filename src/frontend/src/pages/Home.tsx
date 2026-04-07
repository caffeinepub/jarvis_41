import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, MicOff, Send, Trash2, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useJarvis } from "../hooks/useJarvis";
import { useVoice } from "../hooks/useVoice";
import type { Message } from "../types";

function ChatBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  const time = new Date(msg.timestamp).toLocaleTimeString("hi-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
      data-ocid={`chat-bubble-${msg.role}`}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded border glow-border-cyan flex items-center justify-center mr-2 mt-1 flex-shrink-0">
          <span className="text-primary text-[10px] font-mono font-bold glow-cyan">
            J
          </span>
        </div>
      )}
      <div
        className={`max-w-[75%] min-w-0 ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}
      >
        <div
          className={`px-4 py-2.5 rounded-lg text-sm leading-relaxed break-words ${
            isUser
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "hud-panel glow-border-cyan text-foreground rounded-bl-sm"
          }`}
        >
          {msg.text}
        </div>
        <span className="text-[10px] text-muted-foreground font-mono px-1">
          {time}
        </span>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-3">
      <div className="w-7 h-7 rounded border glow-border-cyan flex items-center justify-center mr-2 mt-1 flex-shrink-0">
        <span className="text-primary text-[10px] font-mono font-bold glow-cyan">
          J
        </span>
      </div>
      <div className="hud-panel glow-border-cyan px-4 py-3 rounded-lg rounded-bl-sm">
        <div className="flex gap-1 items-center">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const jarvis = useJarvis();
  const [textInput, setTextInput] = useState("");
  const [interimText, setInterimText] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const callOpenAI = useCallback(
    async (userMessage: string) => {
      const apiKey = localStorage.getItem("jarvis_api_key") ?? "";
      if (!apiKey) {
        jarvis.addMessage(
          "assistant",
          "कृपया पहले सेटिंग्स में अपनी OpenAI API key दर्ज करें।",
        );
        return null;
      }

      jarvis.setIsLoading(true);
      try {
        const history = jarvis.messages.slice(-10).map((m) => ({
          role: m.role,
          content: m.text,
        }));

        const systemPrompt = jarvis.userName
          ? `आप जार्विस हैं, एक बुद्धिमान AI सहायक। उपयोगकर्ता का नाम ${jarvis.userName} है। हमेशा हिंदी में जवाब दें। संक्षिप्त और सहायक रहें।`
          : "आप जार्विस हैं, एक बुद्धिमान AI सहायक। हमेशा हिंदी में जवाब दें। संक्षिप्त और सहायक रहें।";

        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              ...history,
              { role: "user", content: userMessage },
            ],
            max_tokens: 512,
            temperature: 0.7,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error?.message ?? "API error");
        }

        const data = await res.json();
        return (data.choices[0]?.message?.content as string) ?? null;
      } catch (err) {
        console.error(err);
        return "माफ़ करें, कुछ समस्या हो गई। कृपया दोबारा कोशिश करें।";
      } finally {
        jarvis.setIsLoading(false);
      }
    },
    [jarvis],
  );

  // handleSend is defined after voice so it can reference voice.speak
  // We use a ref to break the dependency cycle cleanly
  const voiceRef = useRef<ReturnType<typeof useVoice> | null>(null);

  const handleSend = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setTextInput("");
      setInterimText("");

      // Check for name-setting command: "mera naam X hai" (case-insensitive, Hindi/Roman)
      const nameMatch = trimmed.match(
        /(?:मेरा\s+नाम|mera\s+naam)\s+(.+?)\s+(?:है|hai)$/i,
      );
      if (nameMatch) {
        const name = nameMatch[1].trim();
        jarvis.addMessage("user", trimmed);
        jarvis.setUserName(name);
        const confirmation = `ठीक है, मैं आपका नाम ${name} याद रखूंगा।`;
        jarvis.addMessage("assistant", confirmation);
        if (!isMuted) voiceRef.current?.speak(confirmation);
        return;
      }

      jarvis.addMessage("user", trimmed);
      const reply = await callOpenAI(trimmed);
      if (reply) {
        jarvis.addMessage("assistant", reply);
        if (!isMuted) voiceRef.current?.speak(reply);
      }
    },
    [jarvis, callOpenAI, isMuted],
  );

  const onTranscript = useCallback(
    (text: string, isFinal: boolean) => {
      if (isFinal) {
        setInterimText("");
        handleSend(text);
      } else {
        setInterimText(text);
      }
    },
    [handleSend],
  );

  const voice = useVoice({
    onTranscript,
    onListeningChange: jarvis.setIsListening,
    onSpeakingChange: jarvis.setIsSpeaking,
    onError: (err) => jarvis.addMessage("assistant", `माइक्रोफ़ोन त्रुटि: ${err}`),
  });

  // Keep voiceRef in sync so handleSend can call voice.speak without a stale ref
  voiceRef.current = voice;

  // Auto scroll to bottom on any update
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  });

  return (
    <div className="flex-1 flex flex-col relative min-h-0">
      {/* Messages area */}
      <ScrollArea className="flex-1 px-3 sm:px-6 py-4" ref={scrollRef}>
        <div className="max-w-2xl mx-auto">
          {jarvis.messages.map((msg) => (
            <ChatBubble key={msg.id} msg={msg} />
          ))}
          {jarvis.isLoading && <TypingIndicator />}

          {/* Interim speech text */}
          {interimText && (
            <div className="flex justify-end mb-3">
              <div className="max-w-[75%] px-4 py-2.5 rounded-lg text-sm text-primary-foreground bg-primary opacity-60 italic border border-primary animate-pulse">
                {interimText}…
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Status bar */}
      {(jarvis.isListening || jarvis.isSpeaking) && (
        <div className="px-4 py-1.5 bg-card border-t border-primary flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-[pulse-ring_2s_ease-in-out_infinite]" />
          <span className="text-xs font-mono text-primary glow-cyan">
            {jarvis.isListening ? "सुन रहा हूं..." : "बोल रहा हूं..."}
          </span>
        </div>
      )}

      {/* Bottom input bar */}
      <div
        className="bg-card border-t glow-border-cyan px-3 sm:px-6 py-3"
        data-ocid="chat-input-bar"
      >
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          {/* Mute toggle */}
          <Button
            variant="ghost"
            size="icon"
            className={`flex-shrink-0 border transition-smooth ${
              isMuted
                ? "border-destructive text-destructive"
                : "border-border text-muted-foreground hover:text-primary hover:glow-border-cyan"
            }`}
            onClick={() => {
              if (!isMuted) voice.stopSpeaking();
              setIsMuted((v) => !v);
            }}
            aria-label={isMuted ? "ध्वनि चालू करें" : "ध्वनि बंद करें"}
            data-ocid="toggle-mute"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </Button>

          {/* Text input */}
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(textInput);
                }
              }}
              placeholder="यहाँ टाइप करें या माइक से बोलें..."
              className="hud-input pr-10 font-body text-sm"
              disabled={jarvis.isListening || jarvis.isLoading}
              data-ocid="chat-text-input"
            />
          </div>

          {/* Send text */}
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 border border-border text-muted-foreground hover:text-primary hover:glow-border-cyan transition-smooth"
            onClick={() => handleSend(textInput)}
            disabled={!textInput.trim() || jarvis.isLoading}
            aria-label="भेजें"
            data-ocid="btn-send"
          >
            <Send size={16} />
          </Button>

          {/* Clear */}
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-smooth"
            onClick={jarvis.clearMessages}
            aria-label="बातचीत साफ़ करें"
            data-ocid="btn-clear"
          >
            <Trash2 size={16} />
          </Button>

          {/* Microphone button */}
          <button
            type="button"
            onClick={() => {
              if (jarvis.isListening) {
                voice.stopListening();
              } else {
                voice.startListening();
              }
            }}
            disabled={jarvis.isLoading}
            aria-label={jarvis.isListening ? "सुनना बंद करें" : "बोलें"}
            data-ocid="btn-mic"
            className={`relative w-12 h-12 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              jarvis.isListening
                ? "border-primary bg-primary text-primary-foreground shadow-[0_0_20px_oklch(0.72_0.22_195/0.6)]"
                : "border-border text-muted-foreground hover:border-primary hover:text-primary hover:shadow-[0_0_12px_oklch(0.72_0.22_195/0.4)]"
            }`}
          >
            {jarvis.isListening && (
              <span className="absolute inset-0 rounded-full border-2 border-primary animate-[pulse-ring_2s_ease-in-out_infinite] opacity-60" />
            )}
            {jarvis.isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
        </div>
      </div>

      {/* Floating mic — always visible on all screen sizes */}
      <button
        type="button"
        onClick={() => {
          if (jarvis.isListening) {
            voice.stopListening();
          } else {
            voice.startListening();
          }
        }}
        disabled={jarvis.isLoading}
        aria-label="फ़्लोटिंग माइक"
        data-ocid="floating-mic"
        className={`fixed bottom-24 right-4 z-30 w-14 h-14 rounded-full border-2 flex items-center justify-center shadow-lg transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
          jarvis.isListening
            ? "border-primary bg-primary text-primary-foreground shadow-[0_0_24px_oklch(0.72_0.22_195/0.7)]"
            : "bg-card border-primary text-primary shadow-[0_0_12px_oklch(0.72_0.22_195/0.4)]"
        }`}
      >
        {jarvis.isListening && (
          <span className="absolute inset-0 rounded-full border-2 border-primary animate-[pulse-ring_2s_ease-in-out_infinite] opacity-60" />
        )}
        {jarvis.isListening ? <MicOff size={22} /> : <Mic size={22} />}
      </button>
    </div>
  );
}
