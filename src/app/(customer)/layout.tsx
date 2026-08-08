import type { ReactNode } from "react";
import { CustomerHeader } from "@/components/customer/customer-header";
import { CustomerNavigation } from "@/components/customer/customer-navigation";

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <CustomerHeader />
      <main>{children}</main>
      <CustomerNavigation />
    </div>
  );
}
