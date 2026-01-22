// src/app/api/restaurants/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { 
  initModel, 
  getAllRestaurants,
  getRestaurantsByUUID,
  createRestaurantWithRating 
} from '@/lib/database';
import { RestaurantCreationAttributes, Mealtype } from '@/models/Restaurant';


export async function GET(request: NextRequest) {
  console.log("🔎 GET /api/restaurants HIT");
  console.log("URL =", request.url);

  await initModel();

  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    console.log("UserId =", userId);

    let restaurants;

    if (userId) {
      console.log("Fetching by user…");
      restaurants = await getRestaurantsByUUID(userId);
      console.log("Result count =", restaurants.length);
      return NextResponse.json(restaurants);
    }

    console.log("No userId → fetching all restaurants");
    restaurants = await getAllRestaurants();
    return NextResponse.json(restaurants);

  } catch (error) {
    console.error("❌ API ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch restaurants", detail: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  await initModel();

  try {
    const body = await request.json();
    const {
      userId,
      name,
      address,
      latitude,
      longitude,
      cuisine,
      meal,
      rating_service,
      rating_foodquality,
      rating_ambiance,
      notes,
      priceRange,
      phone,
      website,
      photos
    } = body;

    // -------------------------
    // REQUIRED FIELD VALIDATION
    // -------------------------

    if (
      !userId ||
      !name ||
      !address ||
      !Array.isArray(cuisine) ||
      cuisine.length === 0 ||
      latitude === undefined ||
      longitude === undefined ||
      !meal ||
      !["Breakfast", "Brunch", "Lunch", "Dinner"].includes(meal)
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // -------------------------
    // RATING VALIDATION
    // -------------------------
    const ratingFields = [
      { key: "rating_service", value: rating_service },
      { key: "rating_foodquality", value: rating_foodquality },
      { key: "rating_ambiance", value: rating_ambiance }
    ];

    for (const f of ratingFields) {
      if (typeof f.value !== "number" || f.value < 1 || f.value > 10) {
        return NextResponse.json(
          { error: `${f.key} must be a number between 1 and 10` },
          { status: 400 }
        );
      }
    }

    // -------------------------
    // CONVERT LAT / LNG TO NUMBERS (safe)
    // -------------------------
    const latNum = Number(latitude);
    const lngNum = Number(longitude);

    const restaurant = await createRestaurantWithRating({
      userId,
      name,
      address,
      latitude: latNum,
      longitude: lngNum,
      cuisine,
      meal: meal as Mealtype,
      rating_service,
      rating_foodquality,
      rating_ambiance,
      notes,
      priceRange,
      phone,
      website,
      photos
    });

    return NextResponse.json(restaurant, { status: 201 });
  } catch (error) {
    console.error("Failed to create restaurant:", error);
    return NextResponse.json(
      { error: "Failed to create restaurant" },
      { status: 500 }
    );
  }
}