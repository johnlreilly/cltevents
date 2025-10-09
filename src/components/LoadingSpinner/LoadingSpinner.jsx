/**
 * LoadingSpinner component
 * Displays a loading animation during initial data fetch
 */

/**
 * LoadingSpinner Component
 * @returns {JSX.Element} The loading spinner with message
 */
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="text-center">
        <div className="mb-4">
          <svg
            className="animate-spin h-16 w-16 text-primary mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-onsurface mb-2">
          Stand by... pulling events...
        </h2>
        <p className="text-onsurfacevariant">Loading events from the webs!</p>
      </div>
    </div>
  )
}

export default LoadingSpinner
