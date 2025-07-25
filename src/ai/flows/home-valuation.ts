// src/ai/flows/home-valuation.ts
'use server';
/**
 * @fileOverview A home valuation AI agent.
 *
 * - getHomeValuation - A function that handles the home valuation process.
 * - HomeValuationInput - The input type for the getHomeValuation function.
 * - HomeValuationOutput - The return type for the getHomeValuation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HomeValuationInputSchema = z.object({
  address: z.string().describe('The street address of the home.'),
  bedrooms: z.number().int().min(1).describe('The number of bedrooms in the home.'),
  bathrooms: z.number().min(1).describe('The number of bathrooms in the home.'),
  squareFootage: z.number().int().min(500).describe('The square footage of the home.'),
  lotSize: z.number().int().min(1000).describe('The lot size of the property in square feet.'),
  yearBuilt: z.number().int().min(1900).max(2024).describe('The year the home was built.'),
  renovated: z.boolean().describe('Whether the home has been recently renovated.'),
  nearbySchools: z.string().describe('The names and ratings of nearby schools.'),
  recentSales: z.string().describe('A description of the recent comparable sales in the neighborhood.'),
});
export type HomeValuationInput = z.infer<typeof HomeValuationInputSchema>;

const HomeValuationOutputSchema = z.object({
  valuation: z.number().describe('The estimated market value of the home in USD.'),
  confidenceScore: z.number().min(0).max(1).describe('A score between 0 and 1 indicating the confidence in the valuation. Higher values indicate higher confidence.'),
  reasoning: z.string().describe('The detailed reasoning behind the valuation, including factors that influenced the estimate and how the confidence score was determined.'),
});
export type HomeValuationOutput = z.infer<typeof HomeValuationOutputSchema>;

export async function getHomeValuation(input: HomeValuationInput): Promise<HomeValuationOutput> {
  return homeValuationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'homeValuationPrompt',
  input: {schema: HomeValuationInputSchema},
  output: {schema: HomeValuationOutputSchema},
  prompt: `You are an expert real estate appraiser specializing in the Oakville, Ontario market. Your goal is to provide an accurate and well-reasoned valuation for a given home, along with a confidence score reflecting the reliability of your estimate.

  Consider the following factors when determining the home's value and confidence score:

  - Address: {{{address}}}
  - Bedrooms: {{{bedrooms}}}
  - Bathrooms: {{{bathrooms}}}
  - Square Footage: {{{squareFootage}}} sq ft
  - Lot Size: {{{lotSize}}} sq ft
  - Year Built: {{{yearBuilt}}}
  - Renovated: {{#if renovated}}Yes{{else}}No{{/if}}
  - Nearby Schools: {{{nearbySchools}}}
  - Recent Comparable Sales: {{{recentSales}}}

  Instructions:

  1.  Valuation: Provide a single, definitive valuation for the property in USD. Ensure this value is realistic and justifiable based on the provided information.
  2.  Confidence Score: Determine a confidence score between 0 and 1. A score of 1 indicates very high confidence (e.g., ample comparable sales data, consistent property characteristics), while a score of 0 indicates very low confidence (e.g., limited data, unique property features making comparisons difficult).
  3.  Reasoning: Explain your valuation process step-by-step. Reference specific details from the provided information (e.g., comparable sales prices, school ratings) to justify your estimate and confidence score. Explain how each factor influenced your final valuation.

  Output:
  Return the valuation, confidenceScore, and reasoning in the format specified by the HomeValuationOutputSchema.
  `,
});

const homeValuationFlow = ai.defineFlow(
  {
    name: 'homeValuationFlow',
    inputSchema: HomeValuationInputSchema,
    outputSchema: HomeValuationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

