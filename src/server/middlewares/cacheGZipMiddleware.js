const Cache = require('../utils/cache'); // Import the Cache class

const zlib = require('zlib');

// Create an instance of the cache
// 86400000ms = 24h TTL, 10 seconds cleanup interval, max 10 items
const cache = new Cache(
  60000000,  // TTL (Time to Live) for cached items: 1 hour
  10000,     // Cleanup interval in ms: 10 seconds
  10,        // Maximum number of items in the cache
);

/**
 * Middleware that checks if the response is present in the cache.
 * If it exists, it returns the cached response; otherwise, it proceeds with the request.
 * If the client supports gzip compression, the response is compressed before caching and serving it.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
function cacheGZipMiddleware(req, res, next) {
  // Check if the client accepts gzip compression
  const acceptsGzip = req.headers['accept-encoding'] && req.headers['accept-encoding'].includes('gzip');

  // Use the full URL as the cache key and append gzip support information
  const cacheKey = `${req.originalUrl}-${acceptsGzip ? 'gzip' : 'nogzip'}`;

  // Check if the response is present in the cache
  const cachedResponse = cache.get(cacheKey);

  if (cachedResponse) {
    // If the response is found in the cache and the client accepts gzip, set the Content-Encoding header
    if (acceptsGzip) {
      res.setHeader('Content-Encoding', 'gzip');
    }
    res.setHeader('Content-Type', 'application/json');
    return res.send(cachedResponse);
  }

  // Save the original res.send function
  const originalSend = res.send.bind(res);

  // Override res.send to store the response in the cache
  res.send = (body) => {

    // if the response is not successful, do not cache it
    if (res.statusCode !== 200) {
      return originalSend(body);
    }

    // If gzip is accepted, compress the response and store it in the cache
    if (acceptsGzip) {
      zlib.gzip(body, (err, compressedBody) => {
        if (err) {
          console.error('Compression error:', err);
          return originalSend(body);
        }

        // Store the compressed response in the cache
        cache.set(`${req.originalUrl}-gzip`, compressedBody);

        // Send the uncompressed response
        originalSend(body);
      });
    } else {
      // If gzip is not accepted, store the uncompressed response in the cache
      cache.set(cacheKey, body);
      originalSend(body);
    }
  };

  return next();
}

module.exports = cacheGZipMiddleware;