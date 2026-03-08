# Chirag Chhajer — AI Portfolio

A product designer portfolio built as an AI platform experience.

## Overview

The home screen mimics a conversational AI interface with an input field and four sample prompts. When the user submits a query or clicks a prompt, the view transitions to a chat-style response screen with AI "thinking" indicators and formatted content.

## Architecture

- **Frontend**: React 18 + TypeScript + Tailwind CSS + shadcn/ui components
- **Backend**: Express.js server
- **Routing**: wouter
- **State**: Local component state (no backend needed for current features)
- **Bundler**: Vite

## Pages

- `client/src/pages/Desktop.tsx` — Main portfolio page with home and chat screens

## Screens

1. **Home**: Welcome message, search input, 4 prompt pill buttons (Work, About, Experience, Resume)
2. **Chat / Work**: AI response listing Chirag's projects with placeholder cards
3. **Chat / About**: Bio and background info
4. **Chat / Experience**: Professional timeline
5. **Chat / Resume**: Resume download card
6. **Chat / Out of Scope**: Friendly out-of-scope message with suggested prompts

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
