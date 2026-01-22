// scripts/seedRestaurants.ts
import { initModel, createRestaurant } from "../lib/database";

// -----------------------
// Helper: Extract cuisine
// -----------------------
function extractCuisineFromPlace(place: any): string[] {
  const cuisineTypes = [
    "italian", "chinese", "mexican", "indian", "japanese",
    "american", "thai", "french", "korean", "greek"
  ];

  const cuisines = place.types
    ?.filter((type: string) => cuisineTypes.some(c => type.includes(c)))
    .map((type: string) => {
      for (const cuisine of cuisineTypes) {
        if (type.includes(cuisine)) {
          return cuisine.charAt(0).toUpperCase() + cuisine.slice(1);
        }
      }
      return null;
    })
    .filter(Boolean);

  return cuisines?.length ? cuisines : ["Restaurant"];
}

// -----------------------------
// Helper: Map Google → Restaurant
// -----------------------------
function mapGooglePlaceToRestaurant(place: any) {
  return {
    name: place.name,
    address: place.vicinity,
    latitude: place.geometry.location.lat,
    longitude: place.geometry.location.lng,
    cuisine: extractCuisineFromPlace(place),

    // Optional Restaurant fields
    priceRange: undefined,
    phone: place?.formatted_phone_number || undefined,
    website: place?.website || undefined,
    photos: [],
    isActive: true
  };
}

// --------------------------------------------------
// Fetch Google Places Restaurants
// --------------------------------------------------
async function fetchRestaurantsFromGooglePlaces(city: string, limit = 50) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) throw new Error("Google Maps API key missing.");

  // 1. Get city → latitude/longitude
  const geocodeUrl =
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city)}&key=${apiKey}`;

  const geoRes = await fetch(geocodeUrl);
  const geoData = await geoRes.json();

  if (geoData.status !== "OK" || geoData.results.length === 0) {
    throw new Error(`Could not geocode city: ${city}`);
  }

  const { lat, lng } = geoData.results[0].geometry.location;

  // 2. Fetch restaurants
  const baseUrl =
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json`
    + `?location=${lat},${lng}&radius=5000&type=restaurant&key=${apiKey}`;

  const results: any[] = [];
  let nextPageToken: string | undefined;

  do {
    const url = nextPageToken ? `${baseUrl}&pagetoken=${nextPageToken}` : baseUrl;

    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "OK") {
      throw new Error(`Places API error: ${data.status}`);
    }

    results.push(...data.results);
    nextPageToken = data.next_page_token;

    if (nextPageToken) {
      await new Promise(res => setTimeout(res, 2000)); // Google requirement
    }

  } while (nextPageToken && results.length < limit);

  return results.slice(0, limit).map(mapGooglePlaceToRestaurant);
}

// --------------------------------------------------
// Main Seeding Function
// --------------------------------------------------
export async function seedRestaurantsForCity(city: string, limit = 50) {
  console.log(`🌆 Seeding restaurants for city: ${city}`);

  await initModel();

  try {
    const restaurants = await fetchRestaurantsFromGooglePlaces(city, limit);
    console.log(`Found ${restaurants.length} restaurants. Inserting…`);

    for (const r of restaurants) {
      try {
        await createRestaurant(r);
        console.log(`✅ Added: ${r.name}`);
      } catch (err) {
        console.error(`❌ Failed to add ${r.name}`, err);
      }
    }

    console.log(`✨ FINISHED seeding restaurants for ${city}`);
  } catch (error) {
    console.error(`❌ Error during seeding for ${city}:`, error);
  }
}

// --------------------------------------------------
// Execute directly (supports CLI args)
// --------------------------------------------------
if (import.meta.url === `file://${process.argv[1]}`) {
  // Allow: npx tsx scripts/seedRestaurants.ts Montreal
  const city = process.argv[2] || "Montreal";

  console.log(`🌍 CLI detected → seeding city: ${city}`);

  seedRestaurantsForCity(city, 50)
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}
// npx tsx scripts/seedRestaurants.ts Montreal