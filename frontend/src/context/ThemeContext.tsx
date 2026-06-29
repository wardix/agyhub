import { type ReactNode, createContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined,
)

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme =
      typeof localStorage !== 'undefined'
        ? (localStorage.getItem('theme') as Theme)
        : null
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme
    }
    // Default to dark
    return 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', theme)
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
