import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Eye, EyeOff, Key, Save, Trash2, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const voiceTips = [
  "माइक्रोफ़ोन बटन दबाएं और हिंदी में बोलें",
  "Chrome या Edge ब्राउज़र में सबसे अच्छा काम करता है",
  "पहली बार उपयोग पर ब्राउज़र माइक्रोफ़ोन अनुमति मांगेगा",
  "बोलने के बाद जार्विस स्वचालित रूप से जवाब बोलेगा",
  "स्पीकर आइकन से आवाज़ बंद/चालू कर सकते हैं",
];

export default function Settings() {
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem("jarvis_api_key") ?? "",
  );
  const [userName, setUserName] = useState(
    () => localStorage.getItem("jarvis_user_name") ?? "",
  );
  const [showKey, setShowKey] = useState(false);

  const handleSaveApiKey = () => {
    localStorage.setItem("jarvis_api_key", apiKey.trim());
    toast.success("API key सहेज ली गई", {
      description: "जार्विस अब OpenAI से जुड़ सकता है।",
    });
  };

  const handleClearApiKey = () => {
    localStorage.removeItem("jarvis_api_key");
    setApiKey("");
    toast.info("API key हटा दी गई");
  };

  const handleSaveName = () => {
    localStorage.setItem("jarvis_user_name", userName.trim());
    toast.success("नाम सहेज लिया गया", {
      description: `जार्विस आपको ${userName.trim()} कहकर बुलाएगा।`,
    });
  };

  return (
    <div className="flex-1 px-4 sm:px-6 py-6">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Back nav */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-smooth"
          data-ocid="settings-back"
        >
          <ArrowLeft size={16} />
          <span className="font-mono">वापस जाएं</span>
        </Link>

        <div>
          <h2 className="font-display text-2xl font-bold glow-cyan text-primary tracking-wider uppercase mb-1">
            सेटिंग्स
          </h2>
          <p className="text-sm text-muted-foreground">
            जार्विस को अपने अनुसार कॉन्फ़िगर करें
          </p>
        </div>

        {/* OpenAI API Key */}
        <div
          className="hud-panel glow-border-cyan p-5 space-y-4"
          data-ocid="settings-apikey-panel"
        >
          <div className="flex items-center gap-2 mb-1">
            <Key size={16} className="text-primary" />
            <h3 className="font-display font-semibold text-foreground">
              OpenAI API Key
            </h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            जार्विस को AI जवाब देने के लिए आपकी OpenAI API key चाहिए। यह key केवल आपके
            डिवाइस पर ही सहेजी जाती है।
          </p>

          <div className="space-y-2">
            <Label htmlFor="api-key" className="text-sm text-muted-foreground">
              API Key
            </Label>
            <div className="relative">
              <Input
                id="api-key"
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="hud-input pr-10 font-mono text-sm"
                data-ocid="input-api-key"
              />
              <button
                type="button"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-smooth"
                onClick={() => setShowKey((v) => !v)}
                aria-label={showKey ? "key छुपाएं" : "key दिखाएं"}
              >
                {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSaveApiKey}
              disabled={!apiKey.trim()}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 transition-smooth"
              data-ocid="btn-save-apikey"
            >
              <Save size={14} className="mr-1.5" />
              सहेजें
            </Button>
            <Button
              variant="outline"
              onClick={handleClearApiKey}
              disabled={!apiKey}
              className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-smooth"
              data-ocid="btn-clear-apikey"
            >
              <Trash2 size={14} />
            </Button>
          </div>

          <p className="text-[11px] text-muted-foreground">
            🔒 आपकी API key केवल इस ब्राउज़र में localStorage में सहेजी जाती है। कभी भी
            शेयर न करें।
          </p>
        </div>

        {/* User Name */}
        <div
          className="hud-panel p-5 space-y-4"
          data-ocid="settings-name-panel"
        >
          <div className="flex items-center gap-2 mb-1">
            <User size={16} className="text-primary" />
            <h3 className="font-display font-semibold text-foreground">
              आपका नाम
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            जार्विस आपको इस नाम से बुलाएगा।
          </p>

          <div className="space-y-2">
            <Label
              htmlFor="user-name"
              className="text-sm text-muted-foreground"
            >
              नाम
            </Label>
            <Input
              id="user-name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="जैसे: राज, प्रिया..."
              className="hud-input font-body text-sm"
              data-ocid="input-user-name"
            />
          </div>

          <Button
            onClick={handleSaveName}
            disabled={!userName.trim()}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-smooth"
            data-ocid="btn-save-name"
          >
            <Save size={14} className="mr-1.5" />
            नाम सहेजें
          </Button>
        </div>

        {/* Voice instructions */}
        <div
          className="hud-panel p-5 space-y-3"
          data-ocid="settings-voice-info"
        >
          <h3 className="font-display font-semibold text-foreground">
            वॉइस उपयोग
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {voiceTips.map((tip, i) => (
              <li key={tip} className="flex items-start gap-2">
                <span className="text-primary font-mono text-xs mt-0.5">
                  {String(i + 1).padStart(2, "0")}.
                </span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
