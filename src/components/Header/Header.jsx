/**
 * Header component for CLT Events Discovery
 * Sticky header with app title
 */

/**
 * Header Component
 * @returns {JSX.Element} The header component
 */
function Header() {
  return (
    <div className="bg-surface shadow-sm sticky top-0 z-30 border-b border-outlinevariant">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-onsurface">CLT.show</h1>
      </div>
    </div>
  )
}

export default Header
