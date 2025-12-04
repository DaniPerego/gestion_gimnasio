"use client"

import * as React from "react"
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative flex items-center justify-center rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      title="Cambiar tema"
    >
      {/* Sol: Visible solo en modo oscuro (para cambiar a claro) */}
      <SunIcon className="h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-gray-500 dark:text-gray-400" />
      
      {/* Luna: Visible solo en modo claro (para cambiar a oscuro) */}
      <MoonIcon className="absolute h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-gray-500" />
      
      <span className="sr-only">Cambiar tema</span>
    </button>
  )
}
