import express from 'express';
import cors from "cors";
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { ticketPrompt } from './prompts/ticketPrompt.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.use(express.json());
app.use(cors());

app.post('/process-ticket', async (req, res) => {
    const { rawSummary } = req.body;

    if (!rawSummary) {
        return res.status(400).json({ error: 'Please provide a raw ticket summary' });
    }

    try {
        const promptWithSummary = `${ticketPrompt}\n\n ${rawSummary}`;

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: promptWithSummary }],
        });

        res.status(200).json({
            structuredTicket: response.choices[0].message.content,
        });
    } catch (error) {
        console.error('API Error:', error.message);
        res.status(500).json({
            error: 'Internal server error',
            details: error.response?.data || error.message,
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running`);
});

