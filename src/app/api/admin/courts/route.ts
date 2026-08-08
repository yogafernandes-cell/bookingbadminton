import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { courtInputSchema } from "@/modules/courts/schema";

async function hasActiveAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const user = await db.user.findUnique({ where: { email: session.user.email }, select: { isActive: true } });
  return Boolean(user?.isActive);
}

export async function POST(request: Request) {
  if (!(await hasActiveAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const input = courtInputSchema.parse(await request.json());
    const court = await db.court.create({ data: { ...input, description: input.description || null, imageUrl: input.imageUrl || null } });
    return NextResponse.json({ success: true, court }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Data lapangan belum valid.", fields: error.flatten().fieldErrors }, { status: 422 });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return NextResponse.json({ error: "Nama lapangan sudah digunakan." }, { status: 409 });
    console.error("create-court", error);
    return NextResponse.json({ error: "Lapangan belum dapat ditambahkan." }, { status: 500 });
  }
}
