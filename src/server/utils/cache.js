class Cache {
  /**
   * Creates an instance of Cache.
   * @param {number} ttl - Time to live for cache items in milliseconds.
   * @param {number} cleanupInterval - Interval for checking expired items in milliseconds.
   * @param {number} maxItems - Maximum number of items to store in the cache.
   */
  constructor(ttl, cleanupInterval, maxItems = Infinity) {
    this.ttl = ttl; // Time to live for cache items
    this.cleanupInterval = cleanupInterval; // Interval for cleanup
    this.cache = new Map(); // Store items in a Map for efficient access
    this.maxItems = maxItems; // Maximum number of items allowed in cache

    // Start cleanup process
    this.startCleanup();
  }

  /**
   * Sets an item in the cache.
   * @param {string} key - The key for the item.
   * @param {*} value - The value to be cached.
   */
  set(key, value) {
    // Check if we've reached the maximum number of items
    if (this.cache.size >= this.maxItems) {
      this.evictOldest(); // Evict the oldest item
    }
    // Store the item and its creation time together
    this.cache.set(key, { value, createdAt: Date.now() }); // Store the item with its creation time
  }

  /**
   * Retrieves an item from the cache.
   * @param {string} key - The key for the item.
   * @returns {*} - The cached value or undefined if not found.
   */
  get(key) {
    // Check if the item exists and is not expired
    if (this.cache.has(key) && this.isValid(key)) {
      return this.cache.get(key).value; // Return the cached value
    }
    return undefined; // Item not found or expired
  }

  /**
   * Checks if the item is still valid based on TTL.
   * @param {string} key - The key for the item.
   * @returns {boolean} - True if valid, otherwise false.
   */
  isValid(key) {
    const { createdAt } = this.cache.get(key);
    return (Date.now() - createdAt) < this.ttl; // Check if the item is still valid
  }

  /**
   * Starts the cleanup process to remove expired items.
   */
  startCleanup() {
    setInterval(() => {
      this.cleanup(); // Call cleanup periodically
    }, this.cleanupInterval);
  }

  /**
   * Cleans up expired items from the cache.
   */
  cleanup() {
    this.cache.forEach((_, key) => {
      if (!this.isValid(key)) {
        this.cache.delete(key); // Remove expired items
      }
    });
  }

  /**
   * Evicts the oldest item from the cache.
   */
  evictOldest() {
    let oldestKey = null;
    let oldestTime = Infinity;

    this.cache.forEach(({ createdAt }, key) => {
      if (createdAt < oldestTime) {
        oldestTime = createdAt;
        oldestKey = key;
      }
    });

    if (oldestKey !== null) {
      this.cache.delete(oldestKey); // Remove the oldest item from the cache
    }
  }
}

module.exports = Cache;
