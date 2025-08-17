
'use server';
/**
 * @fileOverview A chatbot assistant to help home sellers.
 *
 * - chat - A function that handles the chatbot conversation.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatInputSchema = z.object({
  message: z.string().describe('The user\'s message to the chatbot.'),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.array(z.object({
        text: z.string()
    })),
  })).optional().describe('The previous conversation history.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  message: z.string().describe('The chatbot\'s response.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const checklistItems = [
    "Declutter living spaces",
    "Complete minor repairs",
    "Deep clean entire house",
    "Stage home with professional guidance",
    "Touch-up painting",
    "Exterior landscaping",
    "Remove excess furniture",
    "Provide Property Tax & Utility Bills",
    "Repair any electrical, mechanical & plumbing if necessary",
];

const prompt = ai.definePrompt({
  name: 'chatbotPrompt',
  input: {schema: ChatInputSchema},
  output: {schema: ChatOutputSchema},
  prompt: `You are a friendly and professional AI assistant for Ken Finch, a real estate agent in Oakville, Ontario. Your purpose is to coach and support home sellers through the process of preparing their home for sale.

  You are currently in a chat with a home seller. Your tone should be encouraging, helpful, and optimistic.

  The seller is working through the following checklist to get their home ready:
  ${checklistItems.map(item => `- ${item}`).join('\n')}

  Your primary jobs are:
  1.  Answer questions the seller has about any of the checklist items. Provide practical advice and tips.
  2.  Help the seller track their progress. They will tell you when they have completed a task.
  3.  Provide encouragement and motivation. Selling a home can be stressful, so be a positive partner.
  4.  If asked about specific services (like cleaners, painters, or stagers), you can suggest that the user "coordinate with Ken Finch for his list of trusted local professionals."
  5.  If asked about products, like a painting touch-up kit, you can suggest they "check out home improvement stores like Home Depot or Lowe's, or find convenient kits on Amazon."

  Keep your responses concise and easy to understand. Use formatting like lists and bold text to improve readability.

  Here is the current conversation history:
  {{#if history}}
    {{#each history}}
      {{#if (eq role 'user')}}
        User: {{{content.[0].text}}}
      {{else}}
        Assistant: {{{content.[0].text}}}
      {{/if}}
    {{/each}}
  {{/if}}

  New user message:
  User: {{{message}}}

  Your response:
  `,
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatbotFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return { message: output!.message };
  }
);
