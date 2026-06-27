import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET!;

// GET /api/orders - lista porudžbina za ulogovanog korisnika
export async function GET(request: Request) {
  try {
    // Dohvati token iz Authorization header-a
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { error: 'Niste prijavljeni' },
        { status: 401 }
      );
    }

    // Verifikacija tokena
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

    const orders = await prisma.order.findMany({
      where: { userId: decoded.userId },
      include: {
        toy: {
          include: {
            ageGroup: true,
            type: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Greška u GET /api/orders:', error);
    return NextResponse.json(
      { error: 'Greška pri dohvatanju porudžbina' },
      { status: 500 }
    );
  }
}

// POST /api/orders - kreiranje porudžbine
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
    const { toyId, quantity } = body;

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

    const totalPrice = toy.price * quantity;

    const order = await prisma.order.create({
      data: {
        userId: decoded.userId,
        toyId,
        quantity,
        totalPrice,
        status: 'RESERVED',
      },
      include: {
        toy: {
          include: {
            ageGroup: true,
            type: true,
          },
        },
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Greška u POST /api/orders:', error);
    return NextResponse.json(
      { error: 'Greška pri kreiranju porudžbine' },
      { status: 500 }
    );
  }
}