/* eslint-disable class-methods-use-this */
const BaseFormatter = require('./base-formatter');

/**
 * JSON formatter for standard API responses
 */
class JsonFormatter extends BaseFormatter {
  /**
   * Format a single item as JSON
   * @param {Object} data - The aggregated data
   * @param {Object} params - Request parameters
   * @returns {Object} JSON object
   */
  formatSingleItem(data, params) {
    return { data };
  }

  /**
   * Format multiple items as JSON
   * @param {Object} data - The aggregated data with items array
   * @param {Object} params - Request parameters
   * @returns {Object} JSON object
   */
  formatItems(data, params) {
    return { data };
  }

  /**
   * Get the content type for JSON
   * @returns {string} MIME type
   */
  getContentType() {
    return 'application/json';
  }
}

module.exports = JsonFormatter;
