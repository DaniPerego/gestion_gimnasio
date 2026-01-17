"use client"

import * as React from "react"
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { setTheme, resolvedTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-9 h-9" />
  }

  return (
    <button
      type="button"
      onClick={() => {
        console.log("Current theme:", theme);
        console.log("Resolved theme:", resolvedTheme);
        const newTheme = resolvedTheme === "dark" ? "light" : "dark";
        console.log("Setting theme to:", newTheme);
        setTheme(newTheme);
      }}
      className="relative flex items-center justify-center rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
      title="Cambiar tema"
      aria-label="Cambiar tema"
    >
      {/* Sol: Visible solo en modo oscuro (para cambiar a claro) */}
      <SunIcon className="h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-gray-500 dark:text-gray-400" />
      
      {/* Luna: Visible solo en modo claro (para cambiar a oscuro) */}
      <MoonIcon className="absolute h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-gray-500" />
      
      <span className="sr-only">Cambiar tema</span>
    </button>
  )
}
