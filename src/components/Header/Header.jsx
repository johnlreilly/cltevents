/**
 * Header component for CLT Events Discovery
 * Sticky header with app title
 */

/**
 * Header Component
 * @param {Object} props - Component props
 * @param {Function} props.onRefresh - Callback for refresh button
 * @param {boolean} props.loading - Loading state
 * @returns {JSX.Element} The header component
 */
function Header({ onRefresh, loading }) {
  return (
    <div className="bg-surface shadow-sm sticky top-0 z-30 border-b border-outlinevariant">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-onsurface">CLT.show</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 rounded-full hover:bg-primarycontainer transition-colors disabled:opacity-50"
            title="Refresh events"
          >
            <svg className="w-6 h-6 text-onsurfacevariant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Header
