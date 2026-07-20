// ============================================================
// Theme Context — manages dark/light mode
// ============================================================
import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

export const useTheme = () => useContext(ThemeContext)

export const ThemeProvider = ({ children }) => {
  // Read saved theme from localStorage, default to 'light'
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') || 'light'
  )

  useEffect(() => {
    // Apply or remove 'dark' class on <html> element
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () =>
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
