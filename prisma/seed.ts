import { hash } from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL belum diatur");
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  const passwordHash = await hash(process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!", 12);
  await db.user.upsert({
    where: { email: "admin@arena.local" },
    update: {},
    create: { name: "Arena Admin", email: "admin@arena.local", passwordHash },
  });
  await db.setting.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, venueName: "Booking Lapangan", address: "Atur alamat arena", adminWhatsapp: "6280000000000", bankName: "Atur bank", bankAccountNumber: "0000000000", bankAccountHolder: "Booking Lapangan" },
  });

  const courts = [
    { name: "Lapangan 1", description: "Lapangan indoor dengan pencahayaan profesional.", floorType: "Karpet Vinyl Premium", hourlyRate: 65000, imageUrl: "/images/courts/court-1.jpg" },
    { name: "Lapangan 2", description: "Lapangan indoor nyaman untuk latihan dan pertandingan.", floorType: "Karpet Standar", hourlyRate: 55000, imageUrl: "/images/courts/court-2.jpg" },
  ];
  for (const court of courts) {
    await db.court.upsert({ where: { name: court.name }, update: court, create: court });
  }

  for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek += 1) {
    await db.operatingHour.upsert({
      where: { dayOfWeek },
      update: { opensAt: "08:00", closesAt: "23:00", slotMinutes: 60, isOpen: true },
      create: { dayOfWeek, opensAt: "08:00", closesAt: "23:00", slotMinutes: 60, isOpen: true },
    });
  }
}

main().finally(() => db.$disconnect());
