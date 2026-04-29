// src/api/openai.js

// ✅ Use raw axios for calls to external, third-party APIs.
// This is correct because it's a different service with different authentication.
import axios from "axios";

// ✅ BEST PRACTICE: Load the API key from environment variables.
// This prevents your secret key from being committed to version control.
// For Vite, use import.meta.env.VITE_...
// For Create React App, use process.env.REACT_APP_...
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export const sendMessageToOpenAI = async (userMessage) => {
  // ✅ Your existing logic is sound and well-structured.
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful nutrition assistant." },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 100,
      },
      {
        // ✅ The headers are specific to this call and correctly constructed.
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error("OpenAI API error:", error.response?.data || error.message);
    return "Sorry, I couldn't respond right now.";
  }
};