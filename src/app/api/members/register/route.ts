import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({ name: z.string().trim().min(3).max(100), email: z.email(), phone: z.string().trim().regex(/^(?:\+62|62|0)8[1-9][0-9]{6,11}$/), password: z.string().min(8).max(100) });
const normalizePhone = (phone: string) => { const digits = phone.replace(/\D/g, ""); return digits.startsWith("0") ? `62${digits.slice(1)}` : digits; };
export async function POST(request: Request) { try { const input = schema.parse(await request.json()); await db.user.create({ data: { name: input.name, email: input.email.toLowerCase(), phone: normalizePhone(input.phone), passwordHash: await hash(input.password, 12), role: "MEMBER" } }); return NextResponse.json({ success: true }, { status: 201 }); } catch (error) { if (error instanceof z.ZodError) return NextResponse.json({ error: "Data pendaftaran belum valid." }, { status: 422 }); if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return NextResponse.json({ error: "Email atau WhatsApp sudah terdaftar." }, { status: 409 }); return NextResponse.json({ error: "Pendaftaran belum dapat diproses." }, { status: 500 }); } }
