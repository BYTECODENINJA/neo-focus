import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme, // Import useTheme as useNextTheme
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
