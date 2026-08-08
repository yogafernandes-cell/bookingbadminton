"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function AdminLogoutButton() { return <button type="button" onClick={() => signOut({ callbackUrl: "/admin/login" })} className="mt-auto flex items-center gap-2 text-sm font-semibold text-muted hover:text-primary"><LogOut className="size-4" />Keluar</button>; }
