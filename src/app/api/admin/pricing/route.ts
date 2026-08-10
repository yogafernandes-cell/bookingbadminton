import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
const schema = z.object({ courtId: z.string().cuid(), dayOfWeek: z.coerce.number().int().min(0).max(6).nullable(), startsAt: z.string().regex(/^\d\d:\d\d$/), endsAt: z.string().regex(/^\d\d:\d\d$/), hourlyRate: z.coerce.number().min(10000) });
export async function POST(request: Request) { const session = await getServerSession(authOptions); if (!session?.user?.email || !(await db.user.findFirst({ where: { email: session.user.email, role: "ADMIN", isActive: true }, select: { id: true } }))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); try { const input = schema.parse(await request.json()); if (input.startsAt >= input.endsAt) return NextResponse.json({ error: "Jam selesai harus setelah jam mulai." }, { status: 422 }); const rule = await db.courtPriceRule.create({ data: input }); return NextResponse.json(rule, { status: 201 }); } catch { return NextResponse.json({ error: "Aturan harga gagal disimpan." }, { status: 422 }); } }
