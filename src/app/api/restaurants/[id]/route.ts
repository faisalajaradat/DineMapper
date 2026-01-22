import { NextRequest, NextResponse } from 'next/server';
import { 
  initModel,
  getRestaurantById,
  getRatingsByRestaurantId
} from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await initModel();

  try {
    // ✅ Next.js 15 requires awaiting params
    const { id } = await params;
    const restaurantId = parseInt(id, 10);

    if (isNaN(restaurantId)) {
      return NextResponse.json(
        { error: 'Invalid restaurant ID' },
        { status: 400 }
      );
    }

    // Fetch the restaurant
    const restaurant = await getRestaurantById(restaurantId);

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    // Fetch ratings separately
    const ratings = await getRatingsByRestaurantId(restaurantId);

    // Respond with clean API shape
    return NextResponse.json({
      restaurant,
      ratings
    });

  } catch (error) {
    console.error('❌ Failed to fetch restaurant details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch restaurant details' },
      { status: 500 }
    );
  }
}