import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET!;

// PUT /api/orders/:id – ažuriranje količine
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = parseInt(id);

    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Niste prijavljeni' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const body = await request.json();
    const { quantity } = body;

    if (!quantity || quantity < 1) {
      return NextResponse.json({ error: 'Količina mora biti veća od 0' }, { status: 400 });
    }

    // Proveri da li porudžbina pripada korisniku
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) {
      return NextResponse.json({ error: 'Porudžbina nije pronađena' }, { status: 404 });
    }
    if (order.userId !== decoded.userId) {
      return NextResponse.json({ error: 'Nemate pristup ovoj porudžbini' }, { status: 403 });
    }

    // Ažuriraj količinu i ukupnu cenu
    const toy = await prisma.toy.findUnique({ where: { id: order.toyId } });
    if (!toy) {
      return NextResponse.json({ error: 'Igračka nije pronađena' }, { status: 404 });
    }
    const totalPrice = toy.price * quantity;

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        quantity,
        totalPrice,
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Greška u PUT /api/orders/[id]:', error);
    return NextResponse.json({ error: 'Greška pri ažuriranju porudžbine' }, { status: 500 });
  }
}

// DELETE /api/orders/:id – otkazivanje porudžbine
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = parseInt(id);

    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Niste prijavljeni' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) {
      return NextResponse.json({ error: 'Porudžbina nije pronađena' }, { status: 404 });
    }
    if (order.userId !== decoded.userId) {
      return NextResponse.json({ error: 'Nemate pristup ovoj porudžbini' }, { status: 403 });
    }

    await prisma.order.delete({
      where: { id: orderId },
    });

    return NextResponse.json({ message: 'Porudžbina uspešno otkazana' });
  } catch (error) {
    console.error('Greška u DELETE /api/orders/[id]:', error);
    return NextResponse.json({ error: 'Greška pri otkazivanju porudžbine' }, { status: 500 });
  }
}