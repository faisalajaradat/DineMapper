import { NextResponse } from 'next/server';
import { updateUser, authenticateToken } from '@/lib/database';

export async function POST(req: Request) {
  try {
    // Authenticate user from JWT
    const user = await authenticateToken(req);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();

    const updatedUser = await updateUser(user.uuid, body);

    return NextResponse.json({
      success: true,
      user: updatedUser
    });

  } catch (error) {
    console.error('❌ Update user error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}