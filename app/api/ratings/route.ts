import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET!;

// GET /api/ratings - sve ocene (javno, ali možeš dodati zaštitu)
export async function GET() {
  try {
    const ratings = await prisma.rating.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        toy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(ratings);
  } catch (error) {
    console.error('Greška u GET /api/ratings:', error);
    return NextResponse.json(
      { error: 'Greška pri dohvatanju ocena' },
      { status: 500 }
    );
  }
}

// POST /api/ratings - dodavanje ocene (samo prijavljeni)
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { error: 'Niste prijavljeni' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const body = await request.json();
    const { toyId, value, comment } = body;

    // Provera da li igračka postoji
    const toy = await prisma.toy.findUnique({
      where: { id: toyId },
    });

    if (!toy) {
      return NextResponse.json(
        { error: 'Igračka nije pronađena' },
        { status: 404 }
      );
    }

    // Provera da li je korisnik već ocenio ovu igračku
    const existingRating = await prisma.rating.findFirst({
      where: {
        userId: decoded.userId,
        toyId,
      },
    });

    if (existingRating) {
      return NextResponse.json(
        { error: 'Već ste ocenili ovu igračku' },
        { status: 400 }
      );
    }

    const rating = await prisma.rating.create({
      data: {
        userId: decoded.userId,
        toyId,
        value,
        comment,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        toy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(rating, { status: 201 });
  } catch (error) {
    console.error('Greška u POST /api/ratings:', error);
    return NextResponse.json(
      { error: 'Greška pri dodavanju ocene' },
      { status: 500 }
    );
  }
}