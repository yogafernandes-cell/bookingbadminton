import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function AdminLoginPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.email) {
    const user = await db.user.findUnique({ where: { email: session.user.email }, select: { role: true, isActive: true } });
    redirect(user?.role === "ADMIN" && user.isActive ? "/admin" : "/member");
  }
  return <div className="fixed inset-0 z-[100] grid place-items-center bg-background px-4"><AdminLoginForm /></div>;
}
