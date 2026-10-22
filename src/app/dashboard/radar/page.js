import React from 'react';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import RadarCliente from './RadarCliente';

export const dynamic = 'force-dynamic';

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default async function RadarPage() {
  const user = await currentUser();
  if (!user) redirect('/');

  // Traemos todos los casos del usuario para el radar
  const casos = await prisma.caso.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  });

  return <RadarCliente casos={casos} />;
}