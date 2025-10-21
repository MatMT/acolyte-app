import { ReactNode } from "react";
import AcolyteSidebar from "@/components/AcolyteSidebar";

export default function AcolyteLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="md:flex">
      <aside className="md:w-72 md:h-screen bg-white">
        <AcolyteSidebar />
      </aside>

      <main className="md:flex-1 md:h-screen md:overflow-y-scroll p-5">
        {children}
      </main>
    </div>
  );
}
