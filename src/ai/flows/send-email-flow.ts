
'use server';
/**
 * @fileOverview A flow for sending emails using SendGrid.
 *
 * - sendEmail - A function that sends an email.
 * - SendEmailInput - The input type for the sendEmail function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import sgMail from '@sendgrid/mail';

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

    if (!process.env.SENDGRID_API_KEY) {
        console.error('SENDGRID_API_KEY is not set in the environment variables.');
        throw new Error('SENDGRID_API_KEY is not set in the environment variables.');
    }
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: input.to,
      from: input.from,
      replyTo: input.replyTo,
      subject: input.subject,
      html: input.html,
    };

    try {
      await sgMail.send(msg);
      console.log('Email sent successfully');
      return { success: true };
    } catch (error) {
      console.error('Error sending email:', error);
      if ((error as any).response) {
        console.error((error as any).response.body)
      }
      throw new Error('Failed to send email.');
    }
  }
);
