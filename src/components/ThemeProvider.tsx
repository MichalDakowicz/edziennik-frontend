import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import { getUserSettings, updateUserSettings } from "../services/api"
import { getCurrentUser } from "../services/auth"

export type Theme = "light" | "dark" | "oled" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const STORAGE_KEY = "edziennik-theme"

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

function applyThemeToDOM(theme: Theme) {
  const root = window.document.documentElement
  root.classList.remove("light", "dark", "oled")

  if (theme === "system") {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    root.classList.add(isDark ? "dark" : "light")
    return
  }

  if (theme === "dark") {
    root.classList.add("dark")
  } else if (theme === "oled") {
    root.classList.add("dark", "oled")
  }
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = STORAGE_KEY,
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  const themeRef = useRef(theme)
  themeRef.current = theme

  useEffect(() => {
    applyThemeToDOM(theme)
  }, [theme])

  useEffect(() => {
    if (theme !== "system") return

    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = () => {
      if (themeRef.current === "system") {
        applyThemeToDOM("system")
      }
    }
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [theme])

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) return

    let cancelled = false

    const syncFromAPI = async () => {
      try {
        const profiles = await getUserSettings(user.id)
        if (cancelled) return
        const apiTheme = profiles?.[0]?.theme_preference as Theme | undefined
        if (apiTheme && apiTheme !== themeRef.current) {
          localStorage.setItem(storageKey, apiTheme)
          setThemeState(apiTheme)
        }
      } catch {
      }
    }

    void syncFromAPI()
    return () => { cancelled = true }
  }, [storageKey])

  const setTheme = useCallback((newTheme: Theme) => {
    localStorage.setItem(storageKey, newTheme)
    setThemeState(newTheme)

    const user = getCurrentUser()
    if (!user) return

    void (async () => {
      try {
        const profiles = await getUserSettings(user.id)
        const profile = profiles?.[0]
        if (profile && profile.theme_preference !== newTheme) {
          await updateUserSettings(profile.id, { theme_preference: newTheme })
        }
      } catch {
      }
    })()
  }, [storageKey])

  const value: ThemeProviderState = {
    theme,
    setTheme,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
