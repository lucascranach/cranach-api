/* eslint-disable class-methods-use-this */
/**
 * Abstract base class for response formatters
 */
class BaseFormatter {
  constructor(mappings, translations) {
    this.mappings = mappings;
    this.translations = translations;
  }

  /**
   * Format a single item response
   * @param {Object} data - The aggregated data
   * @param {Object} language - Language code (e.g., 'de', 'en')
   * @returns {string|Object} Formatted output
   */
  formatSingleItem(data, language) {
    throw new Error('formatSingleItem must be implemented by subclass');
  }

  /**
   * Format multiple items response
   * @param {Object} data - The aggregated data with items array
   * @param {Object} language - Language code (e.g., 'de', 'en')
   * @returns {string|Object} Formatted output
   */
  formatItems(data, language) {
    throw new Error('formatItems must be implemented by subclass');
  }

  /**
   * Get the content type for this formatter
   * @returns {string} MIME type
   */
  getContentType() {
    throw new Error('getContentType must be implemented by subclass');
  }
}


module.exports = BaseFormatter;
