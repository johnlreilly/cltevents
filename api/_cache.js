/**
 * Simple in-memory cache for serverless functions
 * Cache persists for the lifetime of the serverless function container
 *
 * To disable caching for debugging, set environment variable:
 * DISABLE_CACHE=true
 */

const cache = new Map();

/**
 * Get cached data if it exists and is not expired
 * @param {string} key - Cache key
 * @param {number} ttl - Time to live in milliseconds (default: 24 hours)
 * @returns {any|null} Cached data or null if expired/missing
 */
export function getCached(key, ttl = 24 * 60 * 60 * 1000) {
  // Check if caching is disabled
  if (process.env.DISABLE_CACHE === 'true') {
    console.log(`⚠️  Cache disabled for ${key}`);
    return null;
  }

  const cached = cache.get(key);

  if (!cached) {
    console.log(`❌ Cache miss: ${key}`);
    return null;
  }

  const now = Date.now();
  const age = now - cached.timestamp;

  if (age > ttl) {
    console.log(`⏰ Cache expired: ${key} (${Math.round(age / 1000 / 60)} minutes old)`);
    cache.delete(key);
    return null;
  }

  console.log(`✅ Cache hit: ${key} (${Math.round(age / 1000 / 60)} minutes old)`);
  return cached.data;
}

/**
 * Store data in cache with timestamp
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 */
export function setCache(key, data) {
  // Check if caching is disabled
  if (process.env.DISABLE_CACHE === 'true') {
    console.log(`⚠️  Cache disabled, not storing: ${key}`);
    return;
  }

  cache.set(key, {
    data,
    timestamp: Date.now()
  });
  console.log(`💾 Cached: ${key}`);
}

/**
 * Clear all cache entries (useful for testing)
 */
export function clearCache() {
  cache.clear();
  console.log('🗑️  Cache cleared');
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  const stats = {
    entries: cache.size,
    keys: Array.from(cache.keys()),
    ages: {}
  };

  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    const ageMinutes = Math.round((now - value.timestamp) / 1000 / 60);
    stats.ages[key] = `${ageMinutes}m`;
  }

  return stats;
}
