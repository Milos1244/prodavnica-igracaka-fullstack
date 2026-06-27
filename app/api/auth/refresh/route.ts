import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token nedostaje' },
        { status: 401 }
      );
    }

    // Verifikacija refresh tokena
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as { userId: number };

    // Generisanje novog access tokena
    const newToken = jwt.sign(
      { userId: decoded.userId },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return NextResponse.json({ token: newToken });
  } catch (error) {
    return NextResponse.json(
      { error: 'Nevažeći refresh token' },
      { status: 401 }
    );
  }
}