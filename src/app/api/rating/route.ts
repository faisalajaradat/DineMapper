import { NextRequest, NextResponse } from 'next/server';
import { 
  initModel, 
  addRating,
  getRatingsByRestaurantId 
} from '@/lib/database';

export async function POST(request: NextRequest) {
  await initModel();

  try {
    const body = await request.json();
    const { 
      restaurantId,
      userId,
      rating_service,
      rating_foodquality,
      rating_ambiance,
      meal,
      notes
    } = body;

    if (!restaurantId || !userId || rating_service === undefined || rating_foodquality === undefined || rating_ambiance === undefined || !meal) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (typeof rating_service !== 'number' || rating_service < 1 || rating_service > 10 ||
        typeof rating_foodquality !== 'number' || rating_foodquality < 1 || rating_foodquality > 10 ||
        typeof rating_ambiance !== 'number' || rating_ambiance < 1 || rating_ambiance > 10) {
      return NextResponse.json({ error: 'Ratings must be numbers between 1 and 10' }, { status: 400 });
    }

    const rating = await addRating({
      restaurantId,
      userId,
      rating_service,
      rating_foodquality,
      rating_ambiance,
      meal,
      notes
    });
    
    return NextResponse.json(rating, { status: 201 });
  } catch (error) {
    console.error('Failed to add rating:', error);
    return NextResponse.json({ error: 'Failed to add rating' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  await initModel();

  try {
    const url = new URL(request.url);
    const restaurantId = parseInt(url.searchParams.get('restaurantId') || '0');
    
    if (restaurantId === 0) {
      return NextResponse.json({ error: 'Restaurant ID is required' }, { status: 400 });
    }
    
    const ratings = await getRatingsByRestaurantId(restaurantId);
    return NextResponse.json(ratings);
  } catch (error) {
    console.error('Failed to get ratings:', error);
    return NextResponse.json({ error: 'Failed to get ratings' }, { status: 500 });
  }
}