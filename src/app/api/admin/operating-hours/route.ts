import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
const schema = z.object({ hours: z.array(z.object({ dayOfWeek: z.number().int().min(0).max(6), opensAt: z.string().regex(/^\d\d:\d\d$/), closesAt: z.string().regex(/^(?:[01]\d|2[0-4]):[0-5]\d$/), isOpen: z.boolean() })).length(7) });
export async function PUT(request: Request) { const session = await getServerSession(authOptions); if (!session?.user?.email || !(await db.user.findFirst({ where: { email: session.user.email, role: "ADMIN", isActive: true }, select: { id: true } }))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); try { const { hours } = schema.parse(await request.json()); if (hours.some((hour) => hour.isOpen && hour.opensAt >= hour.closesAt)) return NextResponse.json({ error: "Jam tutup harus setelah jam buka." }, { status: 422 }); await db.$transaction(hours.map((hour) => db.operatingHour.upsert({ where: { dayOfWeek: hour.dayOfWeek }, update: hour, create: { ...hour, slotMinutes: 60 } }))); return NextResponse.json({ success: true }); } catch { return NextResponse.json({ error: "Jam operasional gagal disimpan." }, { status: 422 }); } }
