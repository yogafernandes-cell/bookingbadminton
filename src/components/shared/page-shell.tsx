import type { ReactNode } from "react";
import { Brand } from "./brand";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto min-h-screen max-w-7xl">
      <header className="border-b border-border px-5 py-4"><Brand /></header>
      <main className="px-5 py-8">{children}</main>
    </div>
  );
}
