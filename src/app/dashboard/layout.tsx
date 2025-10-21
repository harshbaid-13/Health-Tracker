"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Today", icon: "📊" },
    { href: "/dashboard/meals", label: "Meals", icon: "🍽️" },
    { href: "/dashboard/workouts", label: "Workouts", icon: "💪" },
    { href: "/dashboard/water", label: "Water", icon: "💧" },
    { href: "/dashboard/sleep", label: "Sleep", icon: "😴" },
    { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Health Tracker</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 pb-20">{children}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom">
        <div className="max-w-7xl mx-auto px-2">
          <div className="flex justify-around">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center py-2 px-3 min-w-0 flex-1 ${
                    isActive
                      ? "text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span className="text-2xl mb-1">{item.icon}</span>
                  <span className="text-xs font-medium truncate w-full text-center">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
