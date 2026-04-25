import axios from "axios";
import { getCryptoPrice } from "./utils/tools.js";

const tools = [
  {
    type: "function",
    function: {
      name: "get_crypto_price",
      description: "Get current crypto price in USD and convert it into indian currency",
      parameters: {
        type: "object",
        properties: {
          coin: { type: "string" }
        },
        required: ["coin"]
      }
    }
  }
];

export const handleAI = async (userMessage) => {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "If user asks crypto price, call get_crypto_price tool."
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      tools,
      tool_choice: "auto"
    },
    {
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );

  const message = response.data.choices[0].message;


  if (message.tool_calls) {
    const toolCall = message.tool_calls[0];
    const args = JSON.parse(toolCall.function.arguments);

    const result = await getCryptoPrice(args.coin.toLowerCase());

    // 🔥 Second AI call
    const finalResponse = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "user", content: userMessage },
          message,
          {
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(result)
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return finalResponse.data.choices[0].message.content;
  }

  return message.content;
};