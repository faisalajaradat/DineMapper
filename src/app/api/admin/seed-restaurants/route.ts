import { NextRequest, NextResponse } from 'next/server';
import { seedRestaurantsForCity } from '@/scripts/seedRestaurants';

export async function POST(request: NextRequest) {
  try {
    const { city, limit = 50 } = await request.json();
    
    if (!city) {
      return NextResponse.json(
        { message: 'City is required' }, 
        { status: 400 }
      );
    }

    await seedRestaurantsForCity(city, limit);
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully seeded restaurants for ${city}` 
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// Optional: Add GET method to check if endpoint is available
export async function GET() {
  return NextResponse.json({ 
    message: 'Seed restaurants endpoint is available' 
  });
}