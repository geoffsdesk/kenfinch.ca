
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
  homeType: z.string().describe('The type of home (e.g., Detached, Semi-Detached, Townhouse, Condo Apartment).'),
  bedroomsAboveGrade: z.number().int().min(0).describe('The number of bedrooms above grade in the home.'),
  bedroomsBelowGrade: z.number().int().min(0).describe('The number of bedrooms below grade in the home.'),
  bathrooms: z.number().min(1).describe('The number of bathrooms in the home.'),
  squareFootage: z.number().int().min(500).describe('The square footage of the home.'),
  yearBuilt: z.number().int().min(1900).max(2024).describe('The year the home was built.'),
  renovated: z.boolean().describe('Whether the home has been recently renovated.'),
  finishedBasement: z.boolean().describe('Whether the basement is finished.'),
  garageSpaces: z.number().int().min(0).describe('The number of garage parking spaces.'),
  parkingSpaces: z.number().int().min(0).describe('The total number of parking spaces (including garage).'),
  nearbySchools: z.string().describe('The names and ratings of nearby schools.'),
});
export type HomeValuationInput = z.infer<typeof HomeValuationInputSchema>;

const HomeValuationOutputSchema = z.object({
  valuation: z.number().describe('The estimated market value of the home in CAD.'),
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

  Your valuations should be conservative and reflect the current market conditions in Oakville. Avoid overly optimistic estimates.
  
  If the provided address does not appear to be in Oakville, Ontario, you must begin your 'reasoning' with the following warning: 'This valuation is optimized for the Oakville, Ontario market. Results for properties outside this area may be less accurate due to different market conditions.'

  Consider the following factors when determining the home's value and confidence score. Note that bedrooms below grade (in the basement) typically have a lower market value than bedrooms above grade. A finished basement adds more value than an unfinished one. Detached homes are typically valued highest, followed by semi-detached, townhouse, and then condo apartments. Parking spaces are a significant value-add.

  - Address: {{{address}}}
  - Home Type: {{{homeType}}}
  - Bedrooms (Above Grade): {{{bedroomsAboveGrade}}}
  - Bedrooms (Below Grade): {{{bedroomsBelowGrade}}}
  - Bathrooms: {{{bathrooms}}}
  - Square Footage: {{{squareFootage}}} sq ft
  - Year Built: {{{yearBuilt}}}
  - Renovated: {{#if renovated}}Yes{{else}}No{{/if}}
  - Finished Basement: {{#if finishedBasement}}Yes{{else}}No{{/if}}
  - Garage Parking Spaces: {{{garageSpaces}}}
  - Total Parking Spaces: {{{parkingSpaces}}}
  - Nearby Schools: {{{nearbySchools}}}

  Instructions:

  1.  Valuation: Provide a single, definitive valuation for the property in CAD. Ensure this value is realistic and justifiable based on the provided information.
  2.  Confidence Score: Determine a confidence score between 0 and 1. A score of 1 indicates very high confidence (e.g., ample comparable sales data, consistent property characteristics), while a score of 0 indicates very low confidence (e.g., limited data, unique property features making comparisons difficult).
  3.  Reasoning: Explain your valuation process step-by-step. Reference specific details from the provided information (e.g., home type, finished basement, parking) to justify your estimate and confidence score. Explain how each factor influenced your final valuation.

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
