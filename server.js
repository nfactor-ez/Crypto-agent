import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { handleAI } from "./ai.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.json({ reply: "No message provided" });
    }

    const reply = await handleAI(userMessage);

    return res.json({ reply });

  } catch (error) {
    console.error("Backend Error:", error?.response?.data || error.message);
    const errorMsg = error?.response?.data?.error?.message || error.message;
    return res.status(500).json({ reply: "Error processing request: " + errorMsg });
  }
});

app.listen(5005, () => {
  console.log("MCP Server running on port 5005");
});