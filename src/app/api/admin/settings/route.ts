import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateSettingsSchema } from "@/modules/settings/schema";

const normalizePhone = (phone: string) => { const digits = phone.replace(/\D/g, ""); return digits.startsWith("0") ? `62${digits.slice(1)}` : digits; };

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const admin = await db.user.findFirst({ where: { email: session.user.email, role: "ADMIN", isActive: true }, select: { id: true } });
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const input = updateSettingsSchema.parse(await request.json());
    const settings = await db.setting.upsert({
      where: { id: 1 },
      update: { ...input, adminWhatsapp: normalizePhone(input.adminWhatsapp) },
      create: { id: 1, ...input, adminWhatsapp: normalizePhone(input.adminWhatsapp) },
    });
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Periksa kembali data pengaturan.", fields: error.flatten().fieldErrors }, { status: 422 });
    console.error("update-settings", error);
    return NextResponse.json({ error: "Pengaturan belum dapat disimpan." }, { status: 500 });
  }
}
