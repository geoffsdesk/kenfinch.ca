
'use server';
/**
 * @fileOverview A flow for sending emails (Resend, via src/lib/mail.ts).
 *
 * - sendEmail - A function that sends an email.
 * - SendEmailInput - The input type for the sendEmail function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { sendMail, mailProvider } from '@/lib/mail';

const SendEmailInputSchema = z.object({
    to: z.string().email().describe('The email address of the recipient.'),
    from: z.string().email().describe('The email address of the sender.'),
    replyTo: z.string().email().optional().describe('The email address to reply to.'),
    subject: z.string().describe('The subject of the email.'),
    html: z.string().describe('The HTML body of the email.'),
});
export type SendEmailInput = z.infer<typeof SendEmailInputSchema>;


export async function sendEmail(input: SendEmailInput): Promise<{success: boolean}> {
  return sendEmailFlow(input);
}


const sendEmailFlow = ai.defineFlow(
  {
    name: 'sendEmailFlow',
    inputSchema: SendEmailInputSchema,
    outputSchema: z.object({ success: z.boolean() }),
  },
  async (input) => {

    if (!mailProvider()) {
        console.error('No email provider configured (RESEND_API_KEY).');
        throw new Error('No email provider configured.');
    }

    try {
      await sendMail({
        to: input.to,
        from: input.from,
        replyTo: input.replyTo,
        subject: input.subject,
        html: input.html,
      });
      return { success: true };
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email.');
    }
  }
);
