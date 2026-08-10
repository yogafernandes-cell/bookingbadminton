import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !(await db.user.findFirst({ where: { email: session.user.email, role: "ADMIN", isActive: true }, select: { id: true } }))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await db.courtPriceRule.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ success: true });
}
