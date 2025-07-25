'use server';

/**
 * @fileOverview This file implements the Genkit flow for generating a valuation confidence score.
 *
 * - valuationConfidenceScore - A function that generates a confidence score for a home valuation.
 * - ValuationConfidenceScoreInput - The input type for the valuationConfidenceScore function.
 * - ValuationConfidenceScoreOutput - The return type for the valuationConfidenceScore function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValuationConfidenceScoreInputSchema = z.object({
  homeFeatures: z
    .string()
    .describe('Description of the home features, including size, number of rooms, lot size, and recent renovations.'),
  neighborhoodTrends: z
    .string()
    .describe('Recent real estate sales data and market trends in the Oakville neighborhood.'),
});
export type ValuationConfidenceScoreInput = z.infer<typeof ValuationConfidenceScoreInputSchema>;

const ValuationConfidenceScoreOutputSchema = z.object({
  confidenceScore: z
    .number()
    .describe(
      'A numerical score between 0 and 1 (inclusive) representing the confidence level in the valuation estimate. A higher score indicates higher confidence.'
    ),
  reasoning: z
    .string()
    .describe(
      'Explanation of the factors influencing the confidence score, such as the availability and relevance of recent sales data.'
    ),
});
export type ValuationConfidenceScoreOutput = z.infer<typeof ValuationConfidenceScoreOutputSchema>;

export async function valuationConfidenceScore(
  input: ValuationConfidenceScoreInput
): Promise<ValuationConfidenceScoreOutput> {
  return valuationConfidenceScoreFlow(input);
}

const valuationConfidenceScorePrompt = ai.definePrompt({
  name: 'valuationConfidenceScorePrompt',
  input: {schema: ValuationConfidenceScoreInputSchema},
  output: {schema: ValuationConfidenceScoreOutputSchema},
  prompt: `You are an AI assistant that evaluates the confidence level of a home valuation estimate.

  Based on the provided home features and recent neighborhood sales data, generate a confidence score
  between 0 and 1 (inclusive). A score of 1 indicates very high confidence, while a score of 0
  indicates very low confidence.

  Provide a reasoning for the generated confidence score.

  Home Features: {{{homeFeatures}}}
  Neighborhood Trends: {{{neighborhoodTrends}}}

  Consider these factors:
  - The quantity of comparable sales data available.
  - The similarity of the home features to recent sales.
  - The consistency of sales prices within the neighborhood.
  - The recency of the sales data.

  Confidence Score (0-1): // Provide the confidence score here
  Reasoning: // Explain the factors influencing the confidence score here.
  `,
});

const valuationConfidenceScoreFlow = ai.defineFlow(
  {
    name: 'valuationConfidenceScoreFlow',
    inputSchema: ValuationConfidenceScoreInputSchema,
    outputSchema: ValuationConfidenceScoreOutputSchema,
  },
  async input => {
    const {output} = await valuationConfidenceScorePrompt(input);
    return output!;
  }
);
