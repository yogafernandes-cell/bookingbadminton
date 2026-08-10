import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { convertPaymentProofToWebp } from "@/lib/image";
import { uploadCourtImageWebp } from "@/lib/supabase-storage";
export async function POST(request: Request) { const session = await getServerSession(authOptions); if (!session?.user?.email || !(await db.user.findFirst({ where: { email: session.user.email, role: "ADMIN", isActive: true }, select: { id: true } }))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); const form = await request.formData(); const file = form.get("file"); if (!(file instanceof File) || file.size > 5 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) return NextResponse.json({ error: "Gunakan foto JPG, PNG, atau WebP maksimal 5 MB." }, { status: 422 }); try { const imageUrl = await uploadCourtImageWebp(await convertPaymentProofToWebp(Buffer.from(await file.arrayBuffer()))); return NextResponse.json({ imageUrl }); } catch { return NextResponse.json({ error: "Foto belum dapat diupload." }, { status: 500 }); } }
