// scripts/runScript.ts
import { seedRestaurantsForCity } from '../src/scripts/seedRestaurants';

// This function can be called from an API route or admin interface
export async function runSeedingScript(city: string, limit: number = 50) {
  try {
    await seedRestaurantsForCity(city, limit);
    return { success: true, message: `Successfully seeded restaurants for ${city}` };
  } catch (error) {
    console.error('Seeding error:', error);
    return { success: false, message: 'Failed to seed restaurants' };
  }
}