import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import wikiRouter from './wiki/index.js';
import { augmentPromptWithWiki } from './wiki/rag.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const MODEL_URL = process.env.MODEL_URL || 'http://localhost:8000/chat/completions';

app.use(express.json());

// Mount Wiki API router
app.use('/api/wiki', wikiRouter);

// Proxy chat completions request with optional RAG wiki augmentation
app.post('/api/chat', async (req, res) => {
  const { messages, conversationId, forceWiki } = req.body;

  try {
    // Augment messages with RAG wiki context if available
    const augmentedMessages = augmentPromptWithWiki(messages, forceWiki);
    const pythonPayload = JSON.stringify({ messages: augmentedMessages, conversationId });

    const url = new URL(MODEL_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 8000,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(pythonPayload),
      },
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      });

      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error('Model server connection error:', err.message);
      res.writeHead(200, { 'Content-Type': 'text/event-stream' });
      res.write(`data: ${JSON.stringify({ content: "📚 **[Wiki RAG Context Injected]**\n\nNote: Python model server at " + MODEL_URL + " is not reachable. Running in built-in simulation streaming mode with retrieved Wiki context." })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    });

    proxyReq.write(pythonPayload);
    proxyReq.end();
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Internal server proxy error' });
  }
});

app.listen(PORT, () => {
  console.log(`Express proxy server running on port ${PORT}, forwarding to model server at ${MODEL_URL}`);
});
