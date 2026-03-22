
import { config } from 'dotenv';
config();

import '@/ai/flows/home-valuation.ts';
import '@/ai/flows/valuation-confidence-score.ts';
import '@/ai/flows/send-email-flow.ts';
import '@/ai/flows/chatbot-flow.ts';
