const { WebSocketServer } = require("ws");

/**
 * 与 ro-Aichat/chat-back 一致：按 model 选择密钥与上游，流式转发给前端。
 * 密钥仅从服务端环境变量读取，勿提交到仓库。
 */
const MODEL_CONFIGS = {
  "qwen-plus": {
    apiKey: () =>
      process.env.AI_KEY_QWEN ||
      process.env.VITE_API_KEY ||
      process.env.DASHSCOPE_API_KEY,
    apiUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
    modelName: "qwen-plus",
  },
  mimo: {
    apiKey: () =>
      process.env.AI_KEY_MIMO || process.env.VITE_MIMO_API_KEY,
    apiUrl: "https://api.xiaomimimo.com/v1/chat/completions",
    modelName: "mimo-v2-flash",
  },
};

function attachAiChatWebSocket(server) {
  const wss = new WebSocketServer({ server, path: "/api/ai/ws" });

  wss.on("connection", (ws) => {
    ws.on("message", async (raw) => {
      try {
        const data = JSON.parse(raw.toString());
        const { model = "qwen-plus", messages } = data;

        const entry = MODEL_CONFIGS[model] || MODEL_CONFIGS["qwen-plus"];
        const apiKey = typeof entry.apiKey === "function" ? entry.apiKey() : entry.apiKey;

        if (!apiKey) {
          ws.send(
            JSON.stringify({
              error: `未配置 ${model} 对应的环境变量（AI_KEY_QWEN / AI_KEY_MIMO 等）`,
            }),
          );
          return;
        }

        const response = await fetch(entry.apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: entry.modelName,
            messages: messages || [],
            stream: true,
          }),
        });

        if (!response.ok) {
          const errBody = await response.json().catch(() => ({}));
          ws.send(
            JSON.stringify({
              error: `API ${response.status}: ${JSON.stringify(errBody)}`,
            }),
          );
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed === "data: [DONE]") continue;
            if (!trimmed.startsWith("data: ")) continue;
            try {
              const json = JSON.parse(trimmed.slice(6));
              const chunk = json.choices?.[0]?.delta?.content || "";
              if (chunk) ws.send(JSON.stringify({ content: chunk }));
            } catch (e) {
              console.error("ai stream parse", e);
            }
          }
        }

        ws.send(JSON.stringify({ done: true }));
      } catch (err) {
        console.error(err);
        ws.send(JSON.stringify({ error: err.message || String(err) }));
      }
    });
  });

  return wss;
}

module.exports = { attachAiChatWebSocket };
