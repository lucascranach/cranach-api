const JsonFormatter = require('./json-formatter');
const LidoFormatter = require('./lido-formatter');

/**
 * Factory for creating appropriate formatter based on requested format
 */
class FormatterFactory {
  /**
   * Get formatter instance for the requested format
   * @param {string} format - The requested format (json, lido, etc.)
   * @param {Object} mappings - The entity mappings
   * @returns {BaseFormatter} Formatter instance
   */
  static getFormatter(format, mappings, translations) {
    switch (format) {
      case 'lido':
        return new LidoFormatter(mappings, translations);
      case 'json':
      default:
        return new JsonFormatter(mappings, translations);
    }
  }
}

module.exports = FormatterFactory;
