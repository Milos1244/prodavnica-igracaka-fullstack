import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/toys/:id
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const toyId = parseInt(id);

    if (isNaN(toyId)) {
      return NextResponse.json(
        { error: 'ID mora biti broj' },
        { status: 400 }
      );
    }

    const toy = await prisma.toy.findUnique({
      where: { id: toyId },
      include: {
        ageGroup: true,
        type: true,
        ratings: true,
      },
    });

    if (!toy) {
      return NextResponse.json(
        { error: 'Igračka nije pronađena' },
        { status: 404 }
      );
    }

    return NextResponse.json(toy);
  } catch (error) {
    console.error('Greška u GET /api/toys/[id]:', error);
    return NextResponse.json(
      { error: 'Greška pri dohvatanju igračke' },
      { status: 500 }
    );
  }
}

// PUT /api/toys/:id
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const toyId = parseInt(id);

    if (isNaN(toyId)) {
      return NextResponse.json(
        { error: 'ID mora biti broj' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const existing = await prisma.toy.findUnique({
      where: { id: toyId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: 'Igračka nije pronađena' },
        { status: 404 }
      );
    }

    const updatedToy = await prisma.toy.update({
      where: { id: toyId },
      data: {
        name: body.name,
        permalink: body.permalink,
        description: body.description,
        targetGroup: body.targetGroup,
        productionDate: body.productionDate ? new Date(body.productionDate) : undefined,
        price: body.price,
        imageUrl: body.imageUrl,
        ageGroupId: body.ageGroupId,
        typeId: body.typeId,
      },
    });

    return NextResponse.json(updatedToy);
  } catch (error) {
    console.error('Greška u PUT /api/toys/[id]:', error);
    return NextResponse.json(
      { error: 'Greška pri ažuriranju igračke' },
      { status: 500 }
    );
  }
}

// DELETE /api/toys/:id
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const toyId = parseInt(id);

    if (isNaN(toyId)) {
      return NextResponse.json(
        { error: 'ID mora biti broj' },
        { status: 400 }
      );
    }

    const existing = await prisma.toy.findUnique({
      where: { id: toyId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: 'Igračka nije pronađena' },
        { status: 404 }
      );
    }

    await prisma.toy.delete({
      where: { id: toyId },
    });

    return NextResponse.json({
      message: `Igračka sa ID ${toyId} je uspešno obrisana`,
    });
  } catch (error) {
    console.error('Greška u DELETE /api/toys/[id]:', error);
    return NextResponse.json(
      { error: 'Greška pri brisanju igračke' },
      { status: 500 }
    );
  }
}