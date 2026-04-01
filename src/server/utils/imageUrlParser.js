/**
 * Parse an image origin URL into components needed for the metadata-exif API.
 *
 * Example URL:
 *  https://lucascranach.org/imageserver-2022/AT_KHM_GG6905_FR001/11_RKD/01_Overall/
 *    AT_KHM_GG6905_FR001_RKD_Overall-001v-origin.jpg
 *
 * Extracted parameters:
 *  artefactId   = AT_KHM_GG6905_FR001
 *  imageType    = rkd
 *  subImageType = overall (optional)
 *  resourceId   = AT_KHM_GG6905_FR001_RKD_Overall-001v.tif
 */

const ENTITY_TYPE_TO_API_TYPE = {
  PAINTING: 'paintings',
  GRAPHIC: 'graphics',
  DRAWING: 'drawings',
};

/**
 * Parse an image origin URL into metadata-exif API query parameters.
 * @param {string} imageUrl - Full URL to an origin image
 * @returns {Object|null} Parsed parameters or null if the URL cannot be parsed
 */
function parseImageUrl(imageUrl) {
  if (!imageUrl) return null;

  try {
    const url = new URL(imageUrl);
    // pathname e.g. /imageserver-2022/AT_KHM_GG6905_FR001/11_RKD/01_Overall/filename.jpg
    const segments = url.pathname.split('/').filter(Boolean);

    // We expect at least:
    // baseFolder / artefactId / imageTypeSegment / filename
    // optionally with subImageTypeSegment before filename
    if (segments.length < 4) return null;

    const artefactId = segments[1];

    // imageType segment: "11_RKD" → "rkd"
    const imageTypeSegment = segments[2];
    const imageType = imageTypeSegment
      .replace(/^\d+_/, '')
      .toLowerCase();

    // subImageType segment (optional): "01_Overall" → "overall"
    let subImageType = null;
    if (segments.length >= 5) {
      const subImageTypeSegment = segments[3];
      subImageType = subImageTypeSegment
        .replace(/^\d+_/, '')
        .toLowerCase();
    }

    // resourceId: strip "-origin" suffix and replace extension with .tif
    const filename = segments[segments.length - 1];
    const resourceId = filename
      .replace(/-origin/, '')
      .replace(/\.\w+$/, '.tif');

    const result = {
      artefactId,
      imageType,
      resourceId,
    };

    if (subImageType) {
      result.subImageType = subImageType;
    }

    return result;
  } catch (e) {
    return null;
  }
}

/**
 * Map an entity type to the API type query parameter.
 * @param {string} entityType - e.g. 'PAINTING', 'GRAPHIC', 'DRAWING'
 * @returns {string|null} API type or null if unknown
 */
function getApiType(entityType) {
  return ENTITY_TYPE_TO_API_TYPE[entityType] || null;
}

module.exports = { parseImageUrl, getApiType };
