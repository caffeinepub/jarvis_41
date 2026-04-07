# Design Brief

## Direction
Jarvis — A sci-fi dark HUD voice assistant with futuristic cyan/blue glowing accents, deep navy background, and geometric UI inspired by Iron Man's interface.

## Tone
Futuristic intelligence without coldness—geometric and precise, leveraging glowing cyan accents and minimal shadows to evoke a sci-fi control system.

## Differentiation
Animated pulsing microphone ring on active listening, glassmorphic HUD panels, and Hindi UI text create a distinctive sci-fi voice assistant experience.

## Color Palette

| Token          | OKLCH           | Role                           |
| -------------- | --------------- | ------------------------------ |
| background     | 0.08 0.01 260   | Deep navy black HUD background |
| foreground     | 0.92 0.01 260   | Light text, maximum contrast   |
| card           | 0.12 0.01 260   | Slightly elevated panels       |
| primary        | 0.72 0.22 195   | Cyan interactive elements      |
| accent         | 0.68 0.25 195   | Bright cyan for emphasis       |
| muted          | 0.18 0.01 260   | Subtle borders and inactive UI |
| destructive    | 0.58 0.2 22     | Red alert action               |

## Typography
- Display: Space Grotesk — geometric, futuristic headings
- Body: Bricolage Grotesque — clean HUD labels and controls
- Scale: hero `text-5xl font-bold`, h2 `text-3xl font-bold`, label `text-sm font-semibold`, body `text-base`

## Elevation & Depth
Glassmorphic panels with backdrop blur and subtle internal glow, no traditional shadows—depth via opacity and glowing cyan borders.

## Structural Zones

| Zone      | Background         | Border       | Notes                                  |
| --------- | ------------------ | ------------ | -------------------------------------- |
| Header    | bg-card/50 + blur  | border-cyan  | HUD control bar with app title         |
| Content   | bg-background      | —            | Main listening area and chat display   |
| Microphone| floating bubble    | glow-border  | Fixed floating action button           |
| Footer    | bg-card/50 + blur  | border-muted | Status display and settings            |

## Spacing & Rhythm
Spacious layout with micro-density on HUD panels (4px gaps), section gaps (16–24px), content padding (20px). Breathing room around microphone bubble and chat output.

## Component Patterns
- Buttons: cyan accent background, glow shadow on hover, rounded-lg with geometric feel
- Microphone: animated pulsing ring (pulse-ring animation), scale-up on active
- Cards/Panels: bg-card/50 + backdrop-blur, subtle cyan borders, rounded-lg
- Text: glow-cyan utility on active/important text, glow-flicker on status indicators

## Motion
- Entrance: fade-in on components, 300ms smooth transition
- Hover: buttons scale and glow intensify, 150ms
- Decorative: pulse-ring on microphone during listening (2s loop), glow-flicker on status text (4s loop)

## Constraints
- Dark mode only—no light theme variance
- Hindi UI text throughout; no English labels
- High contrast for accessibility with glowing elements
- Minimal animation to prevent distraction during voice interaction
- Glassmorphism strictly via backdrop-blur, no solid gradients

## Signature Detail
Animated pulsing ring around floating microphone button during active listening state—the defining affordance that signals voice capture is active, inspired by sci-fi HUD design patterns.
