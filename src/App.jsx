/**
 * Main App component for CLT Events Discovery
 * MVP version - to be refactored into smaller components
 */

import { useState } from 'react'
import useEvents from './hooks/useEvents'
import useFilters from './hooks/useFilters'

function App() {
  const { events, loading, initialLoad } = useEvents()
  const { filteredEvents } = useFilters(events)

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-surface shadow-sm sticky top-0 z-30 border-b border-outlinevariant">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-onsurface">CLT.show</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2">
        {initialLoad && loading ? (
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
        ) : (
          <>
            <div className="mb-6 text-lg text-gray-400 text-center">
              Charlotte shows... all in one place!
            </div>

            {/* Event List */}
            <div className="space-y-4">
              {filteredEvents.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No events found.</p>
                </div>
              ) : (
                filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-surface rounded-3xl border border-outlinevariant overflow-hidden hover:shadow-lg transition-all p-5"
                  >
                    <h3 className="text-xl font-semibold text-onsurface mb-1">{event.name}</h3>
                    <p className="text-sm text-onsurfacevariant">{event.venue}</p>
                    {event.dates && event.dates.length > 0 && (
                      <p className="text-sm text-onsurfacevariant mt-2">
                        {new Date(event.dates[0].date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default App
