const Cache = require('../utils/cache'); // Import the Cache class

// Create an instance of the cache
// 86400000ms = 24h TTL, 10 seconds cleanup interval, max 10 items
const cache = new Cache(
  60000000,
  10000,
  10,
);

/**
 * Middleware that checks if the response is present in the cache.
 * If it exists, it returns the cached response; otherwise, it proceeds with the request.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
function cacheMiddleware(req, res, next) {
  // Use the full URL (including query parameters) as the cache key
  const cacheKey = req.originalUrl;

  // Check if the response exists in the cache
  const cachedResponse = cache.get(cacheKey);
  if (cachedResponse) {
    console.log('Response from cache:', cacheKey);
    // Return the response from the cache
    return res.send(cachedResponse);
  }

  console.log('Response not in cache:', cacheKey);

  // Store the original res.send function
  const originalSend = res.send.bind(res);

  // Overwrite res.send to store the response in the cache before sending it
  res.send = (body) => {
    // Store the response in the cache
    cache.set(cacheKey, body);

    // Call the original res.send function to return the response
    return originalSend(body);
  };

  // Proceed to the next middleware/route
  return next();
}

module.exports = cacheMiddleware;
