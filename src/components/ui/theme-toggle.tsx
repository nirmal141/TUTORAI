import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "./button"

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    // Check for system preference or stored preference
    const storedTheme = localStorage.getItem("theme")
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    
    if (storedTheme === "dark" || (!storedTheme && systemPrefersDark)) {
      setTheme("dark")
      document.documentElement.classList.add("dark")
    } else {
      setTheme("light")
      document.documentElement.classList.remove("dark")
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    
    // Update DOM and localStorage
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    
    localStorage.setItem("theme", newTheme)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="rounded-md h-9 w-9 p-0 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4 text-zinc-700 dark:text-zinc-400" />
      ) : (
        <Sun className="h-4 w-4 text-zinc-700 dark:text-zinc-400" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
} 