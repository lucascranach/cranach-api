/**
 * Content Negotiation Middleware
 * 
 * Determines the response format based on:
 * 1. Query parameter 'format' (highest priority)
 * 2. Accept header
 * 3. Default: JSON
 * 
 * Supported formats:
 * - json (application/json)
 * - lido (application/lido+xml)
 */

const SUPPORTED_FORMATS = {
  json: {
    mimeType: 'application/json',
    queryParam: 'json',
  },
  lido: {
    mimeType: 'application/lido+xml',
    queryParam: 'lido',
  },
};

const DEFAULT_FORMAT = 'json';

/**
 * Parse Accept header and find best matching format
 * @param {string} acceptHeader - The Accept header value
 * @returns {string} - The matched format key
 */
function parseAcceptHeader(acceptHeader) {
  if (!acceptHeader) {
    return DEFAULT_FORMAT;
  }

  // Parse Accept header entries (handling quality values)
  const acceptEntries = acceptHeader
    .split(',')
    .map((entry) => {
      const [mimeType, ...params] = entry.trim().split(';');
      const qMatch = params.find((p) => p.trim().startsWith('q='));
      const quality = qMatch ? parseFloat(qMatch.split('=')[1]) : 1.0;
      return { mimeType: mimeType.trim(), quality };
    })
    .sort((a, b) => b.quality - a.quality); // Sort by quality descending

  // Find first matching format
  const matchedEntry = acceptEntries.find((entry) => {
    const format = Object.keys(SUPPORTED_FORMATS).find(
      (key) => SUPPORTED_FORMATS[key].mimeType === entry.mimeType,
    );
    if (format) {
      return true;
    }

    // Check for wildcards
    if (entry.mimeType === '*/*' || entry.mimeType === 'application/*') {
      return true;
    }

    return false;
  });

  if (matchedEntry) {
    const format = Object.keys(SUPPORTED_FORMATS).find(
      (key) => SUPPORTED_FORMATS[key].mimeType === matchedEntry.mimeType,
    );
    return format || DEFAULT_FORMAT;
  }

  return DEFAULT_FORMAT;
}

/**
 * Content Negotiation Middleware
 * Sets req.api.format based on query parameter or Accept header
 */
function contentNegotiationMiddleware(req, res, next) {
  // Initialize req.api if it doesn't exist
  if (!req.api) {
    req.api = {};
  }

  let format = DEFAULT_FORMAT;

  // 1. Check query parameter (highest priority)
  if (req.query.format) {
    const requestedFormat = req.query.format.toLowerCase();
    if (Object.keys(SUPPORTED_FORMATS).includes(requestedFormat)) {
      format = requestedFormat;
    }

  // 2. Check Accept header if no valid query param was found
  } else if (req.headers.accept) {
    format = parseAcceptHeader(req.headers.accept);
  }

  // Store the determined format
  req.api.format = format;
  req.api.contentType = SUPPORTED_FORMATS[format].mimeType;

  next();
}

module.exports = contentNegotiationMiddleware;
module.exports.SUPPORTED_FORMATS = SUPPORTED_FORMATS;
module.exports.DEFAULT_FORMAT = DEFAULT_FORMAT;
