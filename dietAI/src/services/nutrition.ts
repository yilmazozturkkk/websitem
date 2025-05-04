/**
 * Represents a food item with its nutritional information.
 */
export interface FoodItem {
  /**
   * The name of the food item.
   */
  name: string;
  /**
   * The calorie count of the food item.
   */
  calories: number;
  /**
   * The amount of carbohydrates in grams.
   */
  carbohydrates: number;
  /**
   * The amount of protein in grams.
   */
  protein: number;
  /**
   * The amount of fat in grams.
   */
  fat: number;
}

/**
 * Asynchronously retrieves nutritional information for a given food item and portion size.
 *
 * @param foodName The name of the food item.
 * @param portionSize The portion size in grams.
 * @returns A promise that resolves to a FoodItem object containing nutritional information.
 */
export async function getNutrition(foodName: string, portionSize: number): Promise<FoodItem> {
  // TODO: Implement this by calling an API.

  return {
    name: foodName,
    calories: 200,
    carbohydrates: 20,
    protein: 10,
    fat: 5,
  };
}
