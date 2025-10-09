/**
 * Custom React hook for state that persists to localStorage
 * @module hooks/useLocalStorage
 */

import { useState, useEffect } from 'react'

/**
 * React hook that syncs state with localStorage
 * Automatically saves to localStorage on every state change
 * Loads initial value from localStorage if available
 *
 * @param {string} key - localStorage key
 * @param {*} initialValue - Default value if localStorage is empty
 * @returns {[*, Function]} State value and setter function (like useState)
 *
 * @example
 * function MyComponent() {
 *   const [name, setName] = useLocalStorage('username', 'Guest')
 *   // name will persist across page reloads
 *   return <input value={name} onChange={(e) => setName(e.target.value)} />
 * }
 *
 * @example
 * // With array
 * const [favorites, setFavorites] = useLocalStorage('favorites', [])
 * setFavorites(prev => [...prev, newItem])
 *
 * @example
 * // With object
 * const [settings, setSettings] = useLocalStorage('settings', { theme: 'light' })
 * setSettings(prev => ({ ...prev, theme: 'dark' }))
 */
export function useLocalStorage(key, initialValue) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key)
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      // If error also return initialValue
      console.error(`Error loading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value

      // Save state
      setStoredValue(valueToStore)

      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.error(`Error saving localStorage key "${key}":`, error)
    }
  }

  // Listen for changes to localStorage from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue))
        } catch (error) {
          console.error(`Error parsing storage event for key "${key}":`, error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key])

  return [storedValue, setValue]
}

/**
 * Hook for localStorage with expiry time
 * Automatically removes item after specified duration
 *
 * @param {string} key - localStorage key
 * @param {*} initialValue - Default value
 * @param {number} expiryMs - Expiry time in milliseconds
 * @returns {[*, Function]} State value and setter function
 *
 * @example
 * // Cache for 1 hour
 * const [cache, setCache] = useLocalStorageWithExpiry('api-cache', {}, 3600000)
 */
export function useLocalStorageWithExpiry(key, initialValue, expiryMs) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      if (!item) return initialValue

      const parsed = JSON.parse(item)
      const now = new Date().getTime()

      // Check if expired
      if (parsed.expiry && now > parsed.expiry) {
        window.localStorage.removeItem(key)
        return initialValue
      }

      return parsed.value
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      const now = new Date().getTime()
      const item = {
        value: valueToStore,
        expiry: now + expiryMs,
      }

      setStoredValue(valueToStore)

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(item))
      }
    } catch (error) {
      console.error(`Error saving localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue]
}

export default useLocalStorage
