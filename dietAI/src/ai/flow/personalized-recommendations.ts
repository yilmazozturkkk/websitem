'use server';
/**
 * @fileOverview A personalized food recommendation AI agent that generates daily or weekly meal plans.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import { format } from 'date-fns'; // Import date-fns for date formatting

// Extend UserProfileSchema
const UserProfileSchema = z.object({
  name: z.string().describe('The name of the user.'),
  age: z.number().int().min(1, 'Age must be positive').max(120, 'Age seems too high').describe('The age of the user.'),
  gender: z.enum(['male', 'female']).describe('The gender of the user.'),
  height: z.number().describe('The height of the user in centimeters.'),
  weight: z.number().describe('The weight of the user in kilograms.'),
  activityLevel: z.enum(['sedentary', 'lightly active', 'moderately active', 'very active']).describe('The activity level of the user.'),
  dietType: z.enum(['omnivore', 'vegetarian', 'vegan', 'pescatarian', 'halal', 'kosher', 'gluten-free', 'diabetic-friendly']).describe('The diet type of the user.'),
  allergies: z.string().describe('Comma-separated list of allergies or intolerances of the user. Empty string if none.'),
  goal: z.enum(['lose fat', 'maintain', 'gain muscle']).describe('The health goal of the user.'),
  planType: z.enum(['daily', 'weekly']).describe('The desired duration of the meal plan.'), // Add planType (monthly might be too complex for one call)
  startDate: z.string().describe('The start date for the meal plan in YYYY-MM-DD format.'), // Add startDate
  browserLanguage: z.string().describe('The language of the user, e.g. en-US, tr-TR'),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

const MealSchema = z.object({
  dishName: z.string().describe('Name of the dish'),
  description: z.string().describe('A short description of the meal.'),
  portionSize: z.string().describe('The portion size of the meal.'),
  totalCalories: z.number().describe('Approximate total calories for the meal.'),
  macronutrients: z.object({
    carbohydrates: z.number().describe('Grams of carbohydrates.'),
    protein: z.number().describe('Grams of protein.'),
    fat: z.number().describe('Grams of fat.'),
  }).describe('Macronutrient breakdown for the meal.'),
  ingredients: z.string().describe('List of ingredients in the meal.'),
  substitutionSuggestions: z.string().optional().describe('Suggestions for substitutions based on allergies or preferences.'),
}).describe('Details of a single meal.');

const DailyMealPlanSchema = z.object({
  date: z.string().describe('The specific date for this meal plan (YYYY-MM-DD).'),
  dayOfWeek: z.string().describe('The day of the week (e.g., Monday, Tuesday).'),
  breakfast: MealSchema.describe('Suggested breakfast meal.'),
  morningSnack: MealSchema.optional().describe('Suggested morning snack.'),
  lunch: MealSchema.describe('Suggested lunch meal.'),
  afternoonSnack: MealSchema.optional().describe('Suggested afternoon snack.'),
  dinner: MealSchema.describe('Suggested dinner meal.'),
  eveningSnack: MealSchema.optional().describe('Suggested evening snack.'),
  dailyTotalCalories: z.number().describe('Total calculated calories for this specific day.'),
  dailyMacronutrients: z.object({
      carbohydrates: z.number().describe('Total grams of carbohydrates for the day.'),
      protein: z.number().describe('Total grams of protein for the day.'),
      fat: z.number().describe('Total grams of fat for the day.'),
    }).describe('Total macronutrient breakdown for this specific day.'),
}).describe('A full daily meal plan for a specific date.');

// Update Output Schema for potentially multiple days
const PersonalizedRecommendationsOutputSchema = z.object({
  bmi: z.number().describe('The BMI of the user.'),
  idealWeightRange: z.string().describe('The ideal weight range for the user (e.g., "60-75 kg").'),
  bmiInterpretation: z.string().describe('A brief, gentle interpretation of the BMI (e.g., Healthy weight, Slightly overweight).'),
  recommendedDailyCalories: z.number().describe('Recommended average daily calorie intake for the user based on their goal.'),
  macroBreakdown: z.object({
    carbs: z.number().describe('Percentage of calories from carbohydrates.'),
    protein: z.number().describe('Percentage of calories from protein.'),
    fats: z.number().describe('Percentage of calories from fats.'), // Corrected description
  }).describe('Optimal average macronutrient breakdown percentages for the user.'),
  mealPlan: z.array(DailyMealPlanSchema).describe('An array containing the meal plan for each day requested (1 day for daily, 7 days for weekly).'),
  waterIntakeRecommendation: z.string().describe('Recommended daily water intake for the user (e.g., "Drink at least 2.5 liters of water daily.").'),
  activityTip: z.string().optional().describe('An optional light workout or mobility tip relevant to the user.'),
  nutrientAdvice: z.string().optional().describe('Optional advice on specific nutrients based on diet type (e.g., B12 for vegans).'),
  generalTips: z.string().optional().describe('General healthy eating tips or reminders.'),
});

export type PersonalizedRecommendationsOutput = z.infer<typeof PersonalizedRecommendationsOutputSchema>;

export async function getPersonalizedRecommendations(userProfile: UserProfile): Promise<PersonalizedRecommendationsOutput> {
  return personalizedRecommendationsFlow(userProfile);
}

// Update Prompt
const prompt = ai.definePrompt({
  name: 'personalizedRecommendationsPrompt',
  input: { schema: UserProfileSchema },
  output: { schema: PersonalizedRecommendationsOutputSchema },
  prompt: `You are an expert multilingual AI-powered diet and nutrition assistant. Your goal is to provide personalized recommendations to users based on their profile. You MUST respond entirely in the user's browser language: {{{browserLanguage}}}. Maintain a friendly, professional, medically accurate, inclusive, and non-judgmental tone.

Here's the user profile:
Name: {{{name}}}
Age: {{{age}}}
Gender: {{{gender}}}
Height: {{{height}}} cm
Weight: {{{weight}}} kg
Activity Level: {{{activityLevel}}}
Diet Type: {{{dietType}}}
Allergies/Intolerances: {{{allergies}}}
Health Goal: {{{goal}}}
Plan Type Requested: {{{planType}}} (generate 1 day for 'daily', 7 days for 'weekly')
Plan Start Date: {{{startDate}}}
Browser Language: {{{browserLanguage}}}

Tasks:

1.  Calculations:
    *   Calculate the user's BMI (Weight / Height^2 in meters).
    *   Determine the user's ideal healthy weight range (BMI 18.5-24.9). Format as "XX.X - XX.X kg".
    *   Provide a brief, gentle interpretation of the BMI (e.g., "Sağlıklı kilo aralığındasınız.", "Hedefinize ulaşmak için harika bir başlangıç noktası."). Avoid overly negative terms.
    *   Calculate the recommended average daily calorie intake (TDEE) using Mifflin-St Jeor. Adjust calories based on the user's goal: ~ -500 kcal/day for fat loss, ~ +250-500 kcal/day for muscle gain (be reasonable).
    *   Provide an optimal average macronutrient breakdown (Carbs/Protein/Fats) in percentages, considering their goal and activity level (e.g., higher protein for muscle gain).

2.  Meal Plan Generation:
    *   Generate a meal plan for the number of days specified by 'planType', starting from 'startDate'.
    *   For 'weekly' plans, ensure meals are varied and **DO NOT REPEAT** the exact same dish within the 7 days.
    *   For EACH day in the plan:
        *   Include the 'date' (YYYY-MM-DD format).
        *   Include the 'dayOfWeek' (e.g., Monday, Salı).
        *   Suggest realistic and specific meals for Breakfast, Lunch, Dinner, and optionally Morning Snack, Afternoon Snack, Evening Snack. Consider Turkish and international cuisine.
        *   For EACH meal, provide: Dish name, Brief description, Portion size, Approximate total calories, Approximate macronutrient breakdown (Carbs, Protein, Fat) in grams, List of ingredients, and Substitution suggestions (especially considering allergies/diet type).
        *   Calculate and include the 'dailyTotalCalories' and 'dailyMacronutrients' (total grams for the day). The daily total calories should closely match the 'recommendedDailyCalories' calculated earlier.

3.  Dietary Restrictions and Allergies:
    *   CRITICAL: Ensure the entire meal plan strictly respects the user's 'dietType' and avoids ALL listed 'allergies'. Check ingredients carefully.
    *   Provide sensible substitution suggestions where appropriate (e.g., "Use almond milk instead of dairy milk.", "Substitute tofu for chicken.").

4.  Additional Recommendations:
    *   Recommend an appropriate daily 'waterIntakeRecommendation' in liters.
    *   Provide an optional 'activityTip' (e.g., "Try a 20-minute brisk walk today.", "Consider incorporating some stretching exercises.").
    *   Provide optional 'nutrientAdvice' based on potential gaps (e.g., "For vegan diets, ensure adequate B12 intake, perhaps via fortified foods or supplements.", "Include sources of iron like lentils and spinach.").
    *   Provide optional 'generalTips' (e.g., "Meal prepping can save time during the week.", "Listen to your body's hunger cues.").

5.  Language and Tone:
    *   Respond *exclusively* in the user's browser language: {{{browserLanguage}}}.
    *   Use a friendly, clear, professional, encouraging, and health-conscious tone.

Output Format:
Respond ONLY with a valid JSON object matching the 'PersonalizedRecommendationsOutputSchema'. Ensure all text content (descriptions, tips, names, etc.) is in the target language: {{{browserLanguage}}}.
`,
});

// Update Flow Logic (minor adjustments for calculations before prompt)
const personalizedRecommendationsFlow = ai.defineFlow<typeof UserProfileSchema, typeof PersonalizedRecommendationsOutputSchema>(
  {
    name: 'personalizedRecommendationsFlow',
    inputSchema: UserProfileSchema,
    outputSchema: PersonalizedRecommendationsOutputSchema,
  },
  async (userProfile) => {
    const {
      age,
      gender,
      height,
      weight,
      activityLevel,
      goal,
      // browserLanguage, // browserLanguage is used in the prompt template
      // planType, // planType is used in the prompt template
      // startDate // startDate is used in the prompt template
    } = userProfile;

    // BMI Calculation
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    const idealWeightMin = 18.5 * heightInMeters * heightInMeters;
    const idealWeightMax = 24.9 * heightInMeters * heightInMeters;
    const idealWeightRangeKg = `${idealWeightMin.toFixed(1)} - ${idealWeightMax.toFixed(1)} kg`;

    // BMI Interpretation (simple example, AI will provide localized/gentler version)
    let bmiInterpretation = "Healthy weight";
    if (bmi < 18.5) bmiInterpretation = "Underweight";
    else if (bmi >= 25 && bmi < 30) bmiInterpretation = "Overweight";
    else if (bmi >= 30) bmiInterpretation = "Obese";


    // TDEE Calculation (Mifflin-St Jeor) - BMR
    let bmr: number;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else { // female
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Activity Factor
    let activityFactor: number;
    switch (activityLevel) {
      case 'sedentary': activityFactor = 1.2; break;
      case 'lightly active': activityFactor = 1.375; break;
      case 'moderately active': activityFactor = 1.55; break;
      case 'very active': activityFactor = 1.725; break;
      default: activityFactor = 1.2;
    }

    let maintenanceCalories = bmr * activityFactor;

    // Goal Adjustment
    let recommendedDailyCalories = maintenanceCalories;
    if (goal === 'lose fat') {
      recommendedDailyCalories = Math.max(1200, maintenanceCalories - 500); // Ensure minimum calorie intake
    } else if (goal === 'gain muscle') {
      recommendedDailyCalories = maintenanceCalories + 350; // Moderate surplus
    }

     // Macro Breakdown (Example percentages - AI will refine based on context)
     let carbsPercentage = 45;
     let proteinPercentage = 25;
     let fatsPercentage = 30;

     if (goal === 'gain muscle') {
       proteinPercentage = 30; // Slightly higher protein for muscle gain
       carbsPercentage = 45;
       fatsPercentage = 25;
     } else if (goal === 'lose fat') {
        proteinPercentage = 30; // Higher protein can help satiety
        carbsPercentage = 40;
        fatsPercentage = 30;
     }

    // Pass calculated values needed for the prompt, though the AI is asked to recalculate/confirm
    // The main purpose here is to provide context, but the prompt asks the AI to perform the final calculations and generation.
    const promptInput = {
        ...userProfile,
        // The AI will generate the final interpretation, meal plans, etc.
        // We pass the raw profile data and let the AI handle the complex generation based on the detailed prompt instructions.
    };


    console.log("Sending data to personalizedRecommendationsFlow:", promptInput); // Log input to flow

    const {output} = await prompt(promptInput);

    if (!output) {
      console.error("No output received from the prompt.");
      throw new Error('Failed to generate personalized recommendations. The AI model did not return a valid response.');
    }

     // Basic validation on the output
     if (!output.mealPlan || output.mealPlan.length === 0) {
       console.error("AI output is missing mealPlan array or it's empty:", output);
       throw new Error('AI model failed to generate a meal plan.');
     }
     if (userProfile.planType === 'weekly' && output.mealPlan.length !== 7) {
         console.warn(`Requested a weekly plan but received ${output.mealPlan.length} days.`);
         // Allow proceeding but log warning
     }
     if (userProfile.planType === 'daily' && output.mealPlan.length !== 1) {
         console.warn(`Requested a daily plan but received ${output.mealPlan.length} days.`);
          // Allow proceeding but log warning
     }


    console.log("Received output from personalizedRecommendationsFlow:", output); // Log the output

    // Return the structured output from the AI
    return output;
  }
);