import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { authOptions } from "@/lib/auth";

export default async function AdminLoginPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/admin");
  return <div className="fixed inset-0 z-[100] grid place-items-center bg-background px-4"><AdminLoginForm /></div>;
}
