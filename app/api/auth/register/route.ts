import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, phone, address, favoriteTypes } = body;

    // Provera da li email već postoji
    const existing = await prisma.user.findUnique({
      where: { email },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'Email već postoji' },
        { status: 400 }
      );
    }

    // Hash lozinke
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        address,
        favoriteTypes: favoriteTypes ? JSON.stringify(favoriteTypes) : null,
      },
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    }, { status: 201 });
  } catch (error) {
    console.error('Greška u register:', error);
    return NextResponse.json(
      { error: 'Greška pri registraciji' },
      { status: 500 }
    );
  }
}