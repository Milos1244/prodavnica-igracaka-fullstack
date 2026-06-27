import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/toys - lista svih igračaka
export async function GET() {
  try {
    const toys = await prisma.toy.findMany({
      include: {
        ageGroup: true,
        type: true,
        ratings: {
          select: { value: true },
        },
      },
    });

    return NextResponse.json(toys);
  } catch (error) {
    return NextResponse.json(
      { error: 'Greška pri dohvatanju igračaka' },
      { status: 500 }
    );
  }
}

// POST /api/toys - dodavanje nove igračke
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, permalink, description, targetGroup, productionDate, price, imageUrl, ageGroupId, typeId } = body;

    // Provera obaveznih polja
    if (!name || !permalink || !price || !ageGroupId || !typeId) {
      return NextResponse.json(
        { error: 'Nedostaju obavezna polja (name, permalink, price, ageGroupId, typeId)' },
        { status: 400 }
      );
    }

    const toy = await prisma.toy.create({
      data: {
        name,
        permalink,
        description,
        targetGroup,
        productionDate: new Date(productionDate),
        price,
        imageUrl,
        ageGroupId,
        typeId,
      },
    });

    return NextResponse.json(toy, { status: 201 });
  } catch (error) {
    console.error('Greška u POST /api/toys:', error);
    return NextResponse.json(
      { error: 'Greška pri kreiranju igračke' },
      { status: 500 }
    );
  }
}