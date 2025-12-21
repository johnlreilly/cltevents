import { useState, useEffect } from 'react'
import { getCurrentMode } from '../utils/dateUtils'
import useLocalStorage from './useLocalStorage'

/**
 * Hook for managing day/night theme mode
 * Auto-selects mode based on current time
 * Allows manual override via toggle
 *
 * @returns {Object} Theme state and control functions
 * @returns {string} mode - Current active mode ('day' or 'night')
 * @returns {Function} toggleMode - Function to toggle between modes
 *
 * @example
 * function App() {
 *   const { mode, toggleMode } = useTheme()
 *   return (
 *     <div className={mode === 'night' ? 'dark' : ''}>
 *       <button onClick={toggleMode}>Toggle Theme</button>
 *     </div>
 *   )
 * }
 */
export function useTheme() {
  // Store manual override in localStorage
  // null = auto mode, 'day' or 'night' = manual override
  const [manualMode, setManualMode] = useLocalStorage('cltevents-theme-override', null)

  // Current active mode (computed from manual override or auto-detection)
  const [mode, setMode] = useState(() => {
    return manualMode || getCurrentMode()
  })

  // Update mode when manual override changes
  useEffect(() => {
    setMode(manualMode || getCurrentMode())
  }, [manualMode])

  // Auto-refresh mode every minute (when in auto mode)
  useEffect(() => {
    if (manualMode !== null) return // Skip if manual override active

    const interval = setInterval(() => {
      const newMode = getCurrentMode()
      if (newMode !== mode) {
        setMode(newMode)
      }
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [manualMode, mode])

  // Toggle between day and night modes
  const toggleMode = () => {
    const newMode = mode === 'day' ? 'night' : 'day'
    setManualMode(newMode) // Set manual override
    setMode(newMode)
  }

  return {
    mode,              // 'day' or 'night'
    toggleMode,
  }
}

export default useTheme
