"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function AdminLogoutButton() {
  async function logout() {
    await signOut({ redirect: false });
    window.location.assign("/admin/login");
  }
  return <button type="button" onClick={logout} className="mt-auto flex items-center gap-2 text-sm font-semibold text-muted hover:text-primary"><LogOut className="size-4" />Keluar</button>;
}
