# Chirag Chhajer — AI Portfolio

A product designer portfolio built as an AI platform experience.

## Overview

The home screen mimics a conversational AI interface with an input field and four sample prompts. When the user submits a query or clicks a prompt, the view transitions to a chat-style response screen with Perplexity-like reasoning animation, streaming text output, and collapsible reasoning steps.

## Architecture

- **Frontend**: React 18 + TypeScript + Tailwind CSS + shadcn/ui components
- **Backend**: Express.js server
- **Routing**: wouter
- **State**: Local component state (no backend needed for current features)
- **Bundler**: Vite

## Pages

- `client/src/pages/Desktop.tsx` — Main portfolio page with home and chat screens

## Screens

1. **Home**: "Hola! I'm Chirag's portfolio AI." heading, search input, 4 prompt pill buttons (Work, About, Experience, Resume)
2. **Chat / Work**: Streaming AI response listing Chirag's projects + 4 large and 2 small placeholder case study tiles
3. **Chat / About**: Streaming bio with cooking/swimming personality details
4. **Chat / Experience**: Professional timeline (Sense, Gistr, Nudge Lab)
5. **Chat / Resume**: Resume download card with PDF link
6. **Chat / Out of Scope**: Friendly out-of-scope message with suggested prompts

## Interaction Flow

1. User clicks a prompt chip or types a query
2. Input fills (if chip clicked) → loading spinner in send button
3. Transitions to chat screen with "Chirag's AI is thinking..." loader
4. Reasoning steps appear one-by-one with spinners (Perplexity-style)
5. Reasoning collapses into a clickable summary
6. Response text streams in line-by-line
7. For Work: case study tiles appear after text
8. For Resume: download card appears after text
9. Suggested prompts (remaining 3) shown at the bottom

## Key Specs

- Input box: 720px max-width, 84px min-height, 12px gap to chips
- User message bubble: bg #F0F0F0, Inter Regular, 16px/24px, padding 8px 16px, radius 12px
- Response text: Inter Regular, 16px/24px, letter-spacing 0
- All borders: 0.5px, prompt chip border #E0E0E0 with light drop shadow
- Mobile: 20px left/right margins, 24px/32px heading
- Clock: JetBrains Mono 14px uppercase, fade+slide animation on minute change
- Page load: staggered fade-in + translateY(10px) entrance animations

## Assets

Figma assets stored in `client/public/figmaAssets/`:
- `vector-22.svg` — Logo
- `image-51.png` — Background gradient
- `magnifyingglass.svg` — Search icon
- `frame-103.svg` — Send/arrow-up icon
- `desktoptower.svg` — Work icon
- `user.svg` — About icon
- `briefcase.svg` — Experience icon
- `readcvlogo.svg` — Resume icon

## Running

The app runs via `npm run dev` on port 5000.
