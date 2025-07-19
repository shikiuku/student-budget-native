"use client"

import Link from "next/link"
import { Home, Receipt, Map, Gift, Lightbulb, User, Bell } from "lucide-react"
import { cn } from "@/lib/utils"

interface BottomNavProps {
  currentPage: string
}

export function BottomNav({ currentPage }: BottomNavProps) {
  const navItems = [
    { href: "/", icon: Home, label: "ホーム", id: "home" },
    { href: "/expenses", icon: Receipt, label: "支出", id: "expenses" },
    { href: "/map", icon: Map, label: "マップ", id: "map" },
    { href: "/subsidies", icon: Gift, label: "補助金", id: "subsidies" },
    { href: "/tips", icon: Lightbulb, label: "節約", id: "tips" },
    { href: "/profile", icon: User, label: "設定", id: "profile" },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const IconComponent = item.icon
          const isActive = currentPage === item.id

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-colors",
                isActive ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-blue-600 hover:bg-gray-50",
              )}
            >
              <IconComponent className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
