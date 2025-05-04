'use server';

/**
 * @fileOverview Analyzes a meal described in natural language to identify food items and estimate portion sizes.
 *
 * - analyzeMeal - A function that handles the meal analysis process.
 * - AnalyzeMealInput - The input type for the analyzeMeal function.
 * - AnalyzeMealOutput - The return type for the analyzeMeal function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const AnalyzeMealInputSchema = z.object({
  mealDescription: z.string().describe('A description of the meal consumed.'),
});
export type AnalyzeMealInput = z.infer<typeof AnalyzeMealInputSchema>;

const AnalyzeMealOutputSchema = z.object({
  foodItems: z.array(
    z.object({
      name: z.string().describe('The name of the food item.'),
      estimatedPortion: z
        .string()
        .describe('The estimated portion size of the food item.'),
    })
  ).
    describe('A list of food items identified in the meal and their estimated portion sizes.')
});
export type AnalyzeMealOutput = z.infer<typeof AnalyzeMealOutputSchema>;

export async function analyzeMeal(input: AnalyzeMealInput): Promise<AnalyzeMealOutput> {
  return analyzeMealFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeMealPrompt',
  input: {
    schema: z.object({
      mealDescription: z.string().describe('A description of the meal consumed.'),
    }),
  },
  output: {
    schema: z.object({
      foodItems: z.array(
        z.object({
          name: z.string().describe('The name of the food item.'),
          estimatedPortion: z
            .string()
            .describe('The estimated portion size of the food item.'),
        })
      ).
        describe('A list of food items identified in the meal and their estimated portion sizes.')
    }),
  },
  prompt: `You are a diet expert. Analyze the meal description provided by the user. Identify the food items present in the meal and estimate their portion sizes.

Meal Description: {{{mealDescription}}}

Respond with a JSON format. Include each food item name and estimated portion size.
`,
});

const analyzeMealFlow = ai.defineFlow<
  typeof AnalyzeMealInputSchema,
  typeof AnalyzeMealOutputSchema
>({
  name: 'analyzeMealFlow',
  inputSchema: AnalyzeMealInputSchema,
  outputSchema: AnalyzeMealOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
