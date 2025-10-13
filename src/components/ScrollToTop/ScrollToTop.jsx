/**
 * ScrollToTop component
 * Draggable floating button that appears when scrolling down and scrolls to top when clicked
 * Position is persisted to localStorage
 */

import { useState, useEffect, useRef } from 'react'

/**
 * ScrollToTop Component
 * @returns {JSX.Element|null} The scroll to top button or null if not visible
 */
function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState(() => {
    // Load saved position from localStorage
    const saved = localStorage.getItem('scrollToTop-position')
    return saved ? JSON.parse(saved) : { right: 32, bottom: 32 }
  })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const buttonRef = useRef(null)

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled down 300px
      if (window.scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)

    return () => {
      window.removeEventListener('scroll', toggleVisibility)
    }
  }, [])

  // Save position to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('scrollToTop-position', JSON.stringify(position))
  }, [position])

  const handleMouseDown = (e) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
      setIsDragging(true)
    }
  }

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newRight = window.innerWidth - e.clientX - dragOffset.x
      const newBottom = window.innerHeight - e.clientY - dragOffset.y

      // Keep button within viewport bounds
      const clampedRight = Math.max(0, Math.min(newRight, window.innerWidth - 64))
      const clampedBottom = Math.max(0, Math.min(newBottom, window.innerHeight - 64))

      setPosition({ right: clampedRight, bottom: clampedBottom })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)

      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragOffset])

  const scrollToTop = (e) => {
    // Only scroll if not dragging (to prevent accidental scrolls while dragging)
    if (!isDragging) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }
  }

  if (!isVisible) {
    return null
  }

  return (
    <button
      ref={buttonRef}
      onClick={scrollToTop}
      onMouseDown={handleMouseDown}
      className="fixed p-4 bg-primarycontainer text-onprimarycontainer rounded-full shadow-lg hover:shadow-xl transition-shadow z-50 opacity-70 hover:opacity-100"
      style={{
        right: `${position.right}px`,
        bottom: `${position.bottom}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      title="Scroll to top (draggable)"
      aria-label="Scroll to top"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  )
}

export default ScrollToTop
