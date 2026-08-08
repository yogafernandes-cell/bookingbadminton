import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { promoInputSchema } from "@/modules/promos/schema";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const admin = await db.user.findUnique({ where: { email: session.user.email }, select: { isActive: true } });
  if (!admin?.isActive) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const input = promoInputSchema.parse(await request.json());
    const promo = await db.promo.create({ data: input });
    return NextResponse.json({ success: true, promo }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Data promo belum valid." }, { status: 422 });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return NextResponse.json({ error: "Kode promo sudah digunakan." }, { status: 409 });
    return NextResponse.json({ error: "Promo belum dapat disimpan." }, { status: 500 });
  }
}
