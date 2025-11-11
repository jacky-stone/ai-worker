# AI Worker with MCP Support

Backend service for ai-react-vite chat application. This Cloudflare Worker handles API requests and communicates with OpenAI, with full MCP (Model Context Protocol) tool integration.

## Features

- 🤖 `/api/chat` - AI chat endpoint with OpenAI integration
- 🔧 **MCP Tools Support** - AI can use external tools automatically
  - 🌤️ Weather queries (wttr.in)
  - 🔍 Web search (DuckDuckGo)
  - 🧮 Math calculations
  - ⏰ Time zone queries
- 📋 `/api/tools` - List all available MCP tools
- ✅ `/api/hello` - Health check endpoint
- 🔄 `/api/echo` - Echo test endpoint
- 🌐 CORS enabled for cross-origin requests
- 💬 Conversation history support (keeps last 10 messages)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure OpenAI API Key

#### For Local Development

Create a `.dev.vars` file in the root directory:

```bash
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars` and add your OpenAI API key:

```
OPENAI_API_KEY=sk-your-actual-api-key-here
```

#### For Production

Set the secret using Wrangler CLI:

```bash
wrangler secret put OPENAI_API_KEY
```

When prompted, enter your OpenAI API key.

### 3. Run Development Server

```bash
npm run dev
```

The worker will be available at `http://localhost:8787`

### 4. Deploy to Cloudflare

```bash
npm run deploy
```

## API Endpoints

### POST /api/chat

Chat with AI assistant.

**Request:**
```json
{
  "message": "Hello, how are you?",
  "history": [
    { "role": "user", "content": "Previous message" },
    { "role": "assistant", "content": "Previous response" }
  ]
}
```

**Response:**
```json
{
  "reply": "I'm doing well, thank you for asking!",
  "timestamp": "2025-11-11T12:00:00.000Z"
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "timestamp": "2025-11-11T12:00:00.000Z"
}
```

### GET /api/hello

Simple health check endpoint.

**Response:**
```json
{
  "message": "Hello from Worker!",
  "timestamp": "2025-11-11T12:00:00.000Z"
}
```

### POST /api/echo

Echo test endpoint.

**Request:**
```json
{
  "test": "data"
}
```

**Response:**
```json
{
  "echo": {
    "test": "data"
  },
  "timestamp": "2025-11-11T12:00:00.000Z"
}
```

## Configuration

Edit `wrangler.jsonc` to customize:

- `OPENAI_API_URL` - OpenAI API endpoint (default: https://api.openai.com/v1/chat/completions)
- `OPENAI_MODEL` - OpenAI model to use (default: gpt-3.5-turbo)

Available models:
- `gpt-3.5-turbo` - Fast and cost-effective
- `gpt-4` - More capable but slower and more expensive
- `gpt-4-turbo` - Balance of speed and capability

## Testing

Run tests:

```bash
npm test
```

## Project Structure

```
ai-worker/
├── src/
│   └── index.js          # Main worker code
├── test/
│   └── index.spec.js     # Tests
├── wrangler.jsonc        # Cloudflare Worker configuration
├── .dev.vars.example     # Example environment variables
└── package.json          # Dependencies and scripts
```

## Notes

- The worker limits conversation history to the last 10 messages to save tokens
- Default temperature is set to 0.7 for balanced responses
- Maximum tokens per response is set to 2000
- All endpoints support CORS for cross-origin requests

## Troubleshooting

### Error: OPENAI_API_KEY is not configured

Make sure you've created a `.dev.vars` file for local development or set the secret for production deployment.

### Error: OpenAI API error: 401

Your API key is invalid or expired. Get a new one from https://platform.openai.com/api-keys

### Error: OpenAI API error: 429

You've exceeded your OpenAI API rate limit or quota. Check your usage at https://platform.openai.com/usage

## License

MIT
