
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
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';


const ChatInputSchema = z.object({
  userId: z.string().describe('The ID of the logged-in user.'),
  message: z.string().describe('The user\'s message to the chatbot.'),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.array(z.object({
        text: z.string()
    })),
  })).optional().describe('The previous conversation history.'),
  prepTasks: z.array(z.object({
    label: z.string(),
    checked: z.boolean(),
  })).optional().describe('The list of home preparation tasks and their completion status.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  message: z.string().describe('The chatbot\'s response.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatbotPrompt',
  input: {schema: z.object({
      message: z.string(),
      history: z.array(z.object({
          isUser: z.boolean(),
          text: z.string(),
      })).optional(),
      completedTasks: z.string().optional(),
      incompleteTasks: z.string().optional(),
  })},
  output: {schema: ChatOutputSchema},
  prompt: `You are a friendly and professional AI assistant for Ken Finch, a real estate agent in Oakville, Ontario. Your purpose is to coach and support home sellers through the process of preparing their home for sale.

  You are currently in a chat with a home seller. Your tone should be encouraging, helpful, and optimistic.

  You have been given the seller's progress on their pre-listing preparation checklist. Use this information to provide personalized, contextual advice.
  - If a user says they've completed a task, congratulate them and suggest a logical next step from their "To-Do" list.
  - If a user asks "what should I do next?", suggest a task from their "To-Do" list.
  - If a user asks a question related to a task, use the context of their progress to give a better answer.

  Seller's Progress:
  - Completed Tasks: {{completedTasks}}
  - To-Do: {{incompleteTasks}}

  Your primary jobs are:
  1.  Answer questions the seller has about any of their tasks. Provide practical advice and tips.
  2.  Help the seller track their progress. They will tell you when they have completed a task.
  3.  Provide encouragement and motivation based on their progress. Selling a home can be stressful, so be a positive partner.
  4.  If asked about specific services (like cleaners, painters, or stagers), you can suggest that the user "coordinate with Ken Finch for his list of trusted local professionals."
  5.  If asked about products, like a painting touch-up kit, you can suggest they "check out home improvement stores like Home Depot or Lowe's, or find convenient kits on Amazon."

  Keep your responses concise and easy to understand. Use formatting like lists and bold text to improve readability.

  Here is the current conversation history:
  {{#if history}}
    {{#each history}}
      {{#if isUser}}
        User: {{{text}}}
      {{else}}
        Assistant: {{{text}}}
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
     const history = input.history?.map(msg => ({
        isUser: msg.role === 'user',
        text: msg.content[0]?.text || '',
    }));

    const completedTasks = input.prepTasks?.filter(task => task.checked).map(task => task.label).join(', ') || 'None yet';
    const incompleteTasks = input.prepTasks?.filter(task => !task.checked).map(task => task.label).join(', ') || 'All done!';

    const {output} = await prompt({
        message: input.message,
        history: history,
        completedTasks: completedTasks,
        incompleteTasks: incompleteTasks,
    });
    
    const responseMessage = output!.message;
    
    try {
        await addDoc(collection(db, 'chatbot_logs'), {
            userId: input.userId,
            userMessage: input.message,
            modelResponse: responseMessage,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error logging chatbot conversation:", error);
    }
    
    return { message: responseMessage };
  }
);
