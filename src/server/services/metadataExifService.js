/**
 * Service for fetching image metadata from the CDA metadata-exif API.
 *
 * API endpoint configured via environment variable METADATA_EXIF_API_URL.
 * API key configured via environment variable METADATA_EXIF_API_KEY.
 */
const { parseImageUrl, getApiType } = require('../utils/imageUrlParser');

const API_BASE_URL = process.env.METADATA_EXIF_API_URL
  || 'https://lucascranach.org/data-proxy/metadata-exif.php';
const API_KEY = process.env.METADATA_EXIF_API_KEY || '';

/**
 * Fetch metadata for a single image from the metadata-exif API.
 * @param {Object} params
 * @param {string} params.type - API type (paintings, graphics, drawings)
 * @param {string} params.artefactId - Artefact identifier
 * @param {string} params.imageType - Image type (e.g. rkd)
 * @param {string} params.resourceId - Resource identifier with .tif extension
 * @param {string} [params.subImageType] - Optional sub-image type (e.g. overall)
 * @param {string} [params.lang='de'] - Language
 * @returns {Promise<Object|null>} Parsed JSON response or null on failure
 */
async function fetchImageMetadata(params) {
  const queryParams = new URLSearchParams({
    type: params.type,
    artefactId: params.artefactId,
    imageType: params.imageType,
    resourceId: params.resourceId,
    lang: params.lang || 'de',
  });

  if (params.subImageType) {
    queryParams.set('subImageType', params.subImageType);
  }

  const url = `${API_BASE_URL}?${queryParams.toString()}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': API_KEY,
      },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (e) {
    return null;
  }
}

/**
 * Fetch metadata for all images of an artwork.
 * @param {Object} images - The images object from languageData (keyed by category)
 * @param {string} entityType - Entity type (PAINTING, GRAPHIC, DRAWING)
 * @returns {Promise<Object>} Map of imageId → metadata
 */
async function fetchAllImageMetadata(images, entityType) {
  const metadataMap = {};
  const apiType = getApiType(entityType);

  if (!apiType || !images) return metadataMap;

  const fetchPromises = [];

  Object.keys(images).forEach((categoryKey) => {
    const category = images[categoryKey];
    if (category && category.images && Array.isArray(category.images)) {
      category.images.forEach((image) => {
        const originSrc = image.sizes && image.sizes.origin
          ? image.sizes.origin.src
          : null;
        const parsed = parseImageUrl(originSrc);
        if (!parsed) return;

        const promise = fetchImageMetadata({
          type: apiType,
          ...parsed,
        }).then((metadata) => {
          if (metadata) {
            metadataMap[image.id] = metadata;
          }
        });

        fetchPromises.push(promise);
      });
    }
  });

  await Promise.all(fetchPromises);
  return metadataMap;
}

module.exports = { fetchImageMetadata, fetchAllImageMetadata };
