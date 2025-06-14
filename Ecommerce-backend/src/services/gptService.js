const axios = require("axios");

async function askGPT(message) {
  try {
    const response = await axios.post(
      "http://localhost:11434/api/chat",
      {
        model: "phi3",
        messages: [{ role: "user", content: message }],
        stream: false,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.message.content.trim();
  } catch (error) {
    console.error("Ollama API Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || "Ollama GPT error");
  }
}

module.exports = askGPT;
