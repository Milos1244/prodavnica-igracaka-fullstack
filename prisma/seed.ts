import { PrismaClient } from '@prisma/client';
import toysData from '../lib/toys.json' with { type: 'json' };

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Seeding baze...');

  // 1. AgeGroup
  const ageGroups = new Map();
  for (const toy of toysData) {
    const ag = toy.ageGroup;
    if (!ageGroups.has(ag.ageGroupId)) {
      ageGroups.set(ag.ageGroupId, {
        id: ag.ageGroupId,
        name: ag.name,
        description: ag.description,
      });
    }
  }
  for (const [id, data] of ageGroups) {
    await prisma.ageGroup.upsert({
      where: { id },
      update: {},
      create: data,
    });
  }
  console.log('✅ AgeGroup ubacene');

  // 2. ToyType
  const types = new Map();
  for (const toy of toysData) {
    const t = toy.type;
    if (!types.has(t.typeId)) {
      types.set(t.typeId, {
        id: t.typeId,
        name: t.name,
        description: t.description,
      });
    }
  }
  for (const [id, data] of types) {
    await prisma.toyType.upsert({
      where: { id },
      update: {},
      create: data,
    });
  }
  console.log('✅ ToyType ubacene');

  // 3. Toy
  for (const toy of toysData) {
    await prisma.toy.upsert({
      where: { id: toy.toyId },
      update: {},
      create: {
        id: toy.toyId,
        name: toy.name,
        permalink: toy.permalink,
        description: toy.description,
        targetGroup: toy.targetGroup,
        productionDate: new Date(toy.productionDate),
        price: toy.price,
        imageUrl: toy.imageUrl,
        ageGroupId: toy.ageGroup.ageGroupId,
        typeId: toy.type.typeId,
      },
    });
  }
  console.log('✅ Toy ubacene');

  console.log('🎉 Seed završen!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());