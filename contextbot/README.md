# ContextBot - AI Chat Widget SaaS

ContextBot is a comprehensive Micro-SaaS solution that allows businesses to create AI-powered chat widgets for their websites. It uses OpenAI (GPT-4o) to generate context-aware responses and automatically captures leads from conversations.

## Features

- **Business Profiles**: Create profiles manually or by crawling an existing website URL.
- **AI Chat Widget**: Embeddable widget acting as a customer support agent.
- **Lead Capture**: Automatically detects and acts on emails/phones shared in chat.
- **Real-time Dashboard**: Monitor active chats and captured leads.
- **Zero-Config**: Uses an in-memory data store for easy prototype deployment.

## Prerequisites

- Node.js v18+
- NPM (or Yarn/PNPM)
- OpenAI API Key

## Installation

1.  **Install Dependencies**
    ```bash
    cd contextbot
    npm install
    cd server && npm install
    cd ../client && npm install
    ```

2.  **Environment Setup**
    Copy the example env file and add your OpenAI Key:
    ```bash
    cp .env.example .env
    # Edit .env and set OPENAI_API_KEY=sk-...
    ```

## Running the Application

### Option 1: Run Backend and Frontend Separately (Recommended for Deployment)

**Start Backend Server:**
```bash
cd server
npm run dev
```
Backend will run on: http://localhost:3000

**Start Frontend Client (in a new terminal):**
```bash
cd client
npm run dev
```
Frontend will run on: http://localhost:5173

### Option 2: Run from Root (Development Only)
```bash
# Start backend
npm run server

# In another terminal, start frontend
npm run client
```

This approach allows independent deployment to different platforms (e.g., backend on Heroku/Railway, frontend on Vercel/Netlify).

## Usage Guide

1.  **Login**: Click "Login" (Mock credentials: `demo@user.com` / `demo`).
2.  **Create Profile**: Go to "Profiles", enter a URL (e.g., `https://example.com`) and click "Sync Website".
3.  **Embed Widget**: Copy the script tag from the Profile card.
    ```html
    <script src="http://localhost:3000/widget.js" data-id="your-biz-id"></script>
    ```
    Add this to any HTML file to test.
4.  **Test Chat**: Use the embedded widget or open `http://localhost:3000/widget.js` context directly via `client/public/test.html` (create one if needed).

## Testing

Run unit tests:
```bash
npx jest tests/
```

## Tech Stack

- **Backend**: Express, OpenAI SDK, Cheerio, WebSocket
- **Frontend**: Vite, React, Tailwind CSS
- **Data**: In-Memory JavaScript Object (Mock DB)
