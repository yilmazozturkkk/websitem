'use server';

/**
 * @fileOverview Calculates the total calories and macronutrient breakdown of a meal.
 *
 * - calculateMealNutrition - A function that calculates the nutritional information of a meal.
 * - CalculateMealNutritionInput - The input type for the calculateMealNutrition function.
 * - CalculateMealNutritionOutput - The return type for the calculateMealNutrition function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {FoodItem, getNutrition} from '@/services/nutrition';

const CalculateMealNutritionInputSchema = z.object({
  mealDescription: z.string().describe('A description of the meal consumed.'),
  language: z.string().describe('The language of the meal description.'),
});
export type CalculateMealNutritionInput = z.infer<typeof CalculateMealNutritionInputSchema>;

const CalculateMealNutritionOutputSchema = z.object({
  totalCalories: z.number().describe('The total calorie count of the meal.'),
  carbohydrates: z.number().describe('The total amount of carbohydrates in grams.'),
  protein: z.number().describe('The total amount of protein in grams.'),
  fat: z.number().describe('The total amount of fat in grams.'),
  ingredients: z
    .array(
      z.object({
        name: z.string().describe('The name of the ingredient.'),
        calories: z.number().describe('The calorie count of the ingredient.'),
      })
    )
    .describe('A list of ingredients and their approximate calorie values.'),
});
export type CalculateMealNutritionOutput = z.infer<typeof CalculateMealNutritionOutputSchema>;

export async function calculateMealNutrition(input: CalculateMealNutritionInput): Promise<CalculateMealNutritionOutput> {
  return calculateMealNutritionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'calculateMealNutritionPrompt',
  input: {
    schema: z.object({
      mealDescription: z.string().describe('A description of the meal consumed.'),
      language: z.string().describe('The language of the meal description.'),
    }),
  },
  output: {
    schema: z.object({
      totalCalories: z.number().describe('The total calorie count of the meal.'),
      carbohydrates: z.number().describe('The total amount of carbohydrates in grams.'),
      protein: z.number().describe('The total amount of protein in grams.'),
      fat: z.number().describe('The total amount of fat in grams.'),
      ingredients: z
        .array(
          z.object({
            name: z.string().describe('The name of the ingredient.'),
            calories: z.number().describe('The calorie count of the ingredient.'),
          })
        )
        .describe('A list of ingredients and their approximate calorie values.'),
    }),
  },
  prompt: `You are a multilingual AI-powered nutrition expert.
  Analyze the meal description provided by the user, written in {{{language}}}, identify all food items, 
  estimate their portion sizes if possible, and calculate the total calories and macronutrient breakdown.
  List individual ingredients and their approximate calorie values.

  Meal Description: {{{mealDescription}}}
  
  Respond in the same language as the meal description. The tone should be friendly, professional, and health-conscious.
  Consider Turkish cuisine and other global dishes.
`,
});

const calculateMealNutritionFlow = ai.defineFlow<
  typeof CalculateMealNutritionInputSchema,
  typeof CalculateMealNutritionOutputSchema
>({
  name: 'calculateMealNutritionFlow',
  inputSchema: CalculateMealNutritionInputSchema,
  outputSchema: CalculateMealNutritionOutputSchema,
},
async input => {
  const {output} = await prompt(input);

  if (!output) {
    throw new Error('Failed to calculate meal nutrition.');
  }

  // TODO: Implement the logic to fetch actual nutrition information
  // using the getNutrition service and update the output object.

  let totalCalories = 0;
  let carbohydrates = 0;
  let protein = 0;
  let fat = 0;

  const ingredientsWithCalories: {name: string; calories: number}[] = [];

  if (output.ingredients) {
    for (const ingredient of output.ingredients) {
      const foodItem: FoodItem = await getNutrition(ingredient.name, 100); // Assuming 100g portion size for now

      totalCalories += foodItem.calories;
      carbohydrates += foodItem.carbohydrates;
      protein += foodItem.protein;
      fat += foodItem.fat;

      ingredientsWithCalories.push({
        name: ingredient.name,
        calories: foodItem.calories,
      });
    }
  }


  return {
    totalCalories: totalCalories,
    carbohydrates: carbohydrates,
    protein: protein,
    fat: fat,
    ingredients: ingredientsWithCalories,
  };
});


