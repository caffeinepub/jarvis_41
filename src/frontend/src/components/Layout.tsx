import { Link, useRouterState } from "@tanstack/react-router";
import { Cpu, Settings, Wifi } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const routerState = useRouterState();
  const isSettings = routerState.location.pathname === "/settings";
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = time.toLocaleTimeString("hi-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Ambient background grid */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.72 0.22 195) 1px, transparent 1px), linear-gradient(90deg, oklch(0.72 0.22 195) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Ambient glow top */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full opacity-10 blur-3xl bg-primary" />

      {/* Header */}
      <header
        className="relative z-20 bg-card border-b glow-border-cyan flex items-center justify-between px-4 sm:px-6 py-3"
        data-ocid="header-nav"
      >
        {/* Left: logo + title */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 rounded border glow-border-cyan flex items-center justify-center">
              <Cpu
                size={16}
                className="text-primary animate-[glow-flicker_4s_ease-in-out_infinite]"
              />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary animate-[pulse-ring_2s_ease-in-out_infinite]" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold glow-cyan text-primary tracking-widest uppercase">
              जार्विस
            </h1>
            <p className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase">
              AI सहायक
            </p>
          </div>
        </div>

        {/* Center: status indicators */}
        <div className="hidden sm:flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-[glow-flicker_4s_ease-in-out_infinite]" />
            <span className="text-xs font-mono text-muted-foreground">
              ऑनलाइन
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wifi size={12} className="text-primary" />
            <span className="text-xs font-mono text-muted-foreground">
              जुड़ा हुआ
            </span>
          </div>
          <div className="font-mono text-xs text-primary glow-cyan tabular-nums">
            {timeStr}
          </div>
        </div>

        {/* Right: settings */}
        <div className="flex items-center gap-2">
          <Link
            to="/settings"
            data-ocid="nav-settings"
            className={`p-2 rounded border transition-smooth hover:glow-border-cyan hover:text-primary ${
              isSettings
                ? "border-primary text-primary glow-border-cyan"
                : "border-border text-muted-foreground"
            }`}
            aria-label="सेटिंग्स"
          >
            <Settings size={16} />
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col relative z-10">{children}</main>

      {/* Footer */}
      <footer className="relative z-10 bg-card border-t border-border py-2 px-4">
        <p className="text-center text-[10px] text-muted-foreground font-mono">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            caffeine.ai
          </a>{" "}
          पर बनाया गया
        </p>
      </footer>
    </div>
  );
}
