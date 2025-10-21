"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      router.push("/auth/login");
      router.refresh();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      setIsLoggingOut(false);
    }
  };

  const menuItems = [
    { href: "/admin", label: "Inicio", icon: "🏠" },
    { href: "/admin/events", label: "Eventos", icon: "📅" },
    { href: "/admin/acolytes", label: "Acólitos", icon: "👥" },
    { href: "/admin/assignments", label: "Asignaciones", icon: "📋" },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50 border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Panel Admin</h2>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  pathname === item.href
                    ? "bg-indigo-100 text-indigo-700 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
        >
          <span className="text-xl">🚪</span>
          <span>{isLoggingOut ? "Cerrando sesión..." : "Cerrar Sesión"}</span>
        </button>
      </div>
    </div>
  );
}
