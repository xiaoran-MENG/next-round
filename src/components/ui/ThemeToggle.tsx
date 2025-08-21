"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sun, Moon, Laptop, Monitor } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

const themes = [
    {
        name: "Light",
        value: "light",
        icon: Sun
    },
    {
        name: "Dark",
        value: "dark",
        icon: Moon
    },
    {
        name: "System",
        value: "system",
        icon: Monitor
    }
]

export function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null; // Prevents hydration mismatch

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Toggle theme">
          {resolvedTheme === "dark" ? <Moon className="h-5 w-5" /> : resolvedTheme === "light" ? <Sun className="h-5 w-5" /> : <Laptop className="h-5 w-5" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((item) => (
          <DropdownMenuItem
            className={cn("cursor-pointer", theme === item.value && "bg-accent text-accent-foreground")}
            key={item.value}
            onClick={() => setTheme(item.value)}
          >
            <item.icon className="size-4" />
            {item.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}