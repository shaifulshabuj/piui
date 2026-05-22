---
layout: home

hero:
  name: "piui"
  text: "Desktop UI for the pi coding agent"
  tagline: Electron shell that connects the pi CLI to a React interface over JSONL-RPC.
  actions:
    - theme: brand
      text: Get Started
      link: /installation
    - theme: alt
      text: Architecture
      link: /architecture

features:
  - icon: 🔌
    title: JSONL-RPC Transport
    details: All communication with pi happens over newline-delimited JSON on stdin/stdout — no HTTP, no WebSocket.
  - icon: 🌲
    title: Session Tree
    details: Fork, clone, and navigate branching conversation sessions visually.
  - icon: 🧩
    title: Browser / Electron modes
    details: Runs headlessly in a browser for UI development without needing the pi binary.
---
