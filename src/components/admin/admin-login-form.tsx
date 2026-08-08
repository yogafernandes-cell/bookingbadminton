"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { LoaderCircle, LogIn } from "lucide-react";

export function AdminLoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setSubmitting(true);
    const form = new FormData(event.currentTarget);
    const result = await signIn("credentials", { email: form.get("email"), password: form.get("password"), redirect: false });
    if (result?.error) { setError("Email atau password salah."); setSubmitting(false); return; }
    router.push("/admin"); router.refresh();
  }
  return <form onSubmit={submit} className="w-full max-w-md rounded-xl border border-border bg-surface p-6 sm:p-8"><div className="mx-auto grid size-14 place-items-center rounded-xl bg-primary text-2xl font-black text-primary-foreground">A</div><h1 className="mt-5 text-center text-3xl font-extrabold">Login Admin</h1><p className="mt-2 text-center text-sm text-muted">Masuk untuk mengelola booking dan pembayaran.</p><div className="mt-7 grid gap-5"><label className="grid gap-2 text-sm font-bold">Email<input name="email" type="email" required autoComplete="email" className="h-12 rounded-lg border border-border bg-background px-4 font-normal outline-none focus:border-primary" placeholder="admin@arena.local" /></label><label className="grid gap-2 text-sm font-bold">Password<input name="password" type="password" required minLength={8} autoComplete="current-password" className="h-12 rounded-lg border border-border bg-background px-4 font-normal outline-none focus:border-primary" /></label></div>{error ? <p role="alert" className="mt-5 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm font-semibold text-red-300">{error}</p> : null}<button disabled={submitting} className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3.5 font-extrabold text-primary-foreground disabled:opacity-70">{submitting ? <LoaderCircle className="size-5 animate-spin" /> : <LogIn className="size-5" />}{submitting ? "Memeriksa..." : "Masuk"}</button></form>;
}
