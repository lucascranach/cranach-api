/* eslint-disable class-methods-use-this */
const { create } = require('xmlbuilder2');
const BaseFormatter = require('./base-formatter');
const translations = require('../translations');

/**
 * LIDO XML formatter for cultural heritage objects
 * Implements LIDO 1.0 (Lightweight Information Describing Objects)
 */
class LidoFormatter extends BaseFormatter {
  /**
   * Format a single item as LIDO XML
   * @param {Object} data - The aggregated data
   * @param {Object} language - Language code (e.g., 'de', 'en')
   * @returns {string} LIDO XML string
   */
  formatSingleItem(data, language = 'de') {
    // New consistent structure: results is always array of {language, data}
    if (Array.isArray(data.results) && data.results.length > 0 && data.results[0].language) {
      return this.buildLidoXmlMultilingual(data.results, language);
    }
    // Fallback for unexpected structure
    throw new Error('Invalid data structure for LIDO formatter');
  }

  /**
   * Format multiple items as LIDO XML (not yet implemented)
   * @param {Object} dataParam - The aggregated data with items array
   * @param {Object} languageParam - Language code (e.g., 'de', 'en')
   * @returns {string} LIDO XML string
   */
  formatItems(dataParam, languageParam) {
    // TODO: Implement for multiple items
    throw new Error('LIDO format for multiple items not yet implemented');
  }

  /**
   * Build LIDO 1.0 XML structure with multilingual data
   * @param {Array} resultsArray - Array of {language, data} objects
   * @param {string} primaryLanguage - Primary language code (e.g., 'de', 'en')
   * @returns {string} LIDO XML string
   */
  buildLidoXmlMultilingual(resultsArray, primaryLanguage = 'de') {
    // Extract data for each language
    const languageData = {};
    resultsArray.forEach((item) => {
      languageData[item.language] = item.data;
    });

    // Use primary language data for main structure
    const primaryData = languageData[primaryLanguage] || resultsArray[0].data;
    const inventoryNumber = primaryData.inventory_number ? primaryData.inventory_number : '';

    // Build dynamic source URL
    const baseUrl = process.env.LIDO_BASE_URL || 'https://lucascranach.org/intern/artefacts-preview';
    const sourceUrl = `${baseUrl}/${primaryLanguage}/${inventoryNumber}`;

    const root = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('lido:lidoWrap', {
        'xmlns:lido': 'http://www.lido-schema.org',
        'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        'xsi:schemaLocation': 'http://www.lido-schema.org http://www.lido-schema.org/schema/v1.0/lido-v1.0.xsd',
      });

    const lido = root.ele('lido:lido');

    // LIDO Record ID
    lido.ele('lido:lidoRecID', {
      'lido:type': 'http://terminology.lido-schema.org/lido00100',
      'lido:source': sourceUrl,
    }).txt(`${inventoryNumber}/lido`);

    // Object Published ID
    lido.ele('lido:objectPublishedID', {
      'lido:type': 'http://terminology.lido-schema.org/lido00100',
      'lido:source': sourceUrl,
    }).txt(`${inventoryNumber}/object`);

    // Descriptive Metadata
    const descriptiveMetadata = lido.ele('lido:descriptiveMetadata', { 'xml:lang': primaryLanguage });

    // Object Classification Wrap
    const objectClassificationWrap = descriptiveMetadata.ele('lido:objectClassificationWrap');
    const objectWorkTypeWrap = objectClassificationWrap.ele('lido:objectWorkTypeWrap');
    const objectWorkType = objectWorkTypeWrap.ele('lido:objectWorkType');

    objectWorkType.ele('lido:conceptID', {
      'lido:type': 'http://terminology.lido-schema.org/lido00099',
      'lido:pref': 'preferred',
    }).txt(this.getObjectWorkTypeURI(primaryData.objectworktype_id));

    // Output multilingual terms - always output both de and en in consistent order
    if (languageData.de && languageData.de.objectworktype_value) {
      objectWorkType.ele('lido:term', {
        'lido:pref': 'preferred',
        'xml:lang': 'de',
      }).txt(languageData.de.objectworktype_value);
    }

    if (languageData.en && languageData.en.objectworktype_value) {
      objectWorkType.ele('lido:term', {
        'lido:pref': 'preferred',
        'xml:lang': 'en',
      }).txt(languageData.en.objectworktype_value);
    }

    const objectIdentificationWrap = descriptiveMetadata.ele('lido:objectIdentificationWrap');

    const titleWrap = objectIdentificationWrap.ele('lido:titleWrap');
    const titleSet = titleWrap.ele('lido:titleSet', {
      'lido:type': 'http://vocab.getty.edu/aat/300417200',
    });

    // Output multilingual titles - always output both de and en in consistent order
    if (languageData.de && languageData.de.title) {
      titleSet.ele('lido:appellationValue', {
        'lido:pref': 'http://terminology.lido-schema.org/lido00169',
        'xml:lang': 'de',
      }).txt(languageData.de.title);
    }

    if (languageData.en && languageData.en.title) {
      titleSet.ele('lido:appellationValue', {
        'lido:pref': 'http://terminology.lido-schema.org/lido00169',
        'xml:lang': 'en',
      }).txt(languageData.en.title);
    }

    // Administrative Metadata
    const administrativeMetadata = lido.ele('lido:administrativeMetadata', { 'xml:lang': primaryLanguage });

    // Record Wrap
    const recordWrap = administrativeMetadata.ele('lido:recordWrap');
    recordWrap
      .ele('lido:recordID', {
        'lido:type': 'http://terminology.lido-schema.org/lido00100',
      }).txt(`${inventoryNumber}/record`);

    // Record Type
    const recordType = recordWrap.ele('lido:recordType');
    recordType.ele('lido:conceptID', {
      'lido:type': 'http://terminology.lido-schema.org/lido00099',
    }).txt('http://terminology.lido-schema.org/lido00141');

    // Output multilingual terms in both German and English (from translations)
    const einzelobjektDe = translations.getTranslation('einzelobjekt', 'de');
    const einzelobjektEn = translations.getTranslation('einzelobjekt', 'en');

    if (einzelobjektDe) {
      recordType.ele('lido:term', {
        'xml:lang': 'de',
      }).txt(einzelobjektDe);
    }

    if (einzelobjektEn) {
      recordType.ele('lido:term', {
        'xml:lang': 'en',
      }).txt(einzelobjektEn);
    }

    // Record Source
    const recordSource = recordWrap.ele('lido:recordSource');
    recordSource.ele('lido:legalBodyID', {
      'lido:type': 'http://terminology.lido-schema.org/lido00099',
    }).txt('https://lucascranach.org');

    recordSource.ele('lido:legalBodyName').ele('lido:appellationValue').txt('Lucas Cranach Archive');

    return root.end({ prettyPrint: true });
  }

  /**
   * Build LIDO 1.0 XML structure (legacy, single language)
   * @param {Object} data - The item data
   * @param {string} language - Language code (e.g., 'de', 'en')
   * @returns {string} LIDO XML string
   */
  buildLidoXml(data, language = 'de') {
    // Get inventory number from results array
    const inventoryNumber = data.inventory_number ? data.inventory_number : '';

    // Build dynamic source URL
    const baseUrl = process.env.LIDO_BASE_URL || 'https://lucascranach.org/intern/artefacts-preview';
    const sourceUrl = `${baseUrl}/${language}/${inventoryNumber}`;

    const root = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('lido:lidoWrap', {
        'xmlns:lido': 'http://www.lido-schema.org',
        'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        'xsi:schemaLocation': 'http://www.lido-schema.org http://www.lido-schema.org/schema/v1.0/lido-v1.0.xsd',
      });

    const lido = root.ele('lido:lido');

    // LIDO Record ID
    lido.ele('lido:lidoRecID', {
      'lido:type': 'http://terminology.lido-schema.org/lido00100',
      'lido:source': sourceUrl,
    }).txt(`${inventoryNumber}/lido`);

    // Object Published ID
    lido.ele('lido:objectPublishedID', {
      'lido:type': 'http://terminology.lido-schema.org/lido00100',
      'lido:source': sourceUrl,
    }).txt(`${inventoryNumber}/object`);

    // Descriptive Metadata
    const descriptiveMetadata = lido.ele('lido:descriptiveMetadata', { 'xml:lang': language });

    // Object Classification Wrap
    const objectClassificationWrap = descriptiveMetadata.ele('lido:objectClassificationWrap');

    const objectWorkTypeWrap = objectClassificationWrap.ele('lido:objectWorkTypeWrap');

    const objectWorkType = objectWorkTypeWrap.ele('lido:objectWorkType');
    objectWorkType.ele('lido:conceptID', {
      'lido:type': 'http://terminology.lido-schema.org/lido00099',
      'lido:pref': 'preferred',
    }).txt(this.getObjectWorkTypeURI(data.objectworktype_id));

    // Single language output
    if (data.objectworktype_value) {
      objectWorkType.ele('lido:term', {
        'lido:pref': 'preferred',
        'xml:lang': language,
      }).txt(data.objectworktype_value);
    }

    const objectIdentificationWrap = descriptiveMetadata.ele('lido:objectIdentificationWrap');

    const titleWrap = objectIdentificationWrap.ele('lido:titleWrap');
    titleWrap.ele('lido:titleSet', {
      'lido:type': 'http://vocab.getty.edu/aat/300417200',
    }).ele('lido:appellationValue', {
      'lido:pref': 'http://terminology.lido-schema.org/lido00169',
      'xml:lang': language,
    }).txt(data.title);

    // Administrative Metadata
    const administrativeMetadata = lido.ele('lido:administrativeMetadata', { 'xml:lang': language });

    // Record Wrap
    const recordWrap = administrativeMetadata.ele('lido:recordWrap');
    recordWrap
      .ele('lido:recordID', {
        'lido:type': 'http://terminology.lido-schema.org/lido00100',
      }).txt(`${inventoryNumber}/record`);

    // Record Type
    const recordType = recordWrap.ele('lido:recordType');
    recordType.ele('lido:conceptID', {
      'lido:type': 'http://terminology.lido-schema.org/lido00099',
    }).txt('http://terminology.lido-schema.org/lido00141');

    recordType.ele('lido:term', {
      'xml:lang': language,
    }).txt(translations.getTranslation('einzelobjekt', language));

    // Record Source
    const recordSource = recordWrap.ele('lido:recordSource');
    recordSource.ele('lido:legalBodyID', {
      'lido:type': 'http://terminology.lido-schema.org/lido00099',
    }).txt('https://lucascranach.org');

    recordSource.ele('lido:legalBodyName').ele('lido:appellationValue').txt('Lucas Cranach Archive');

    return root.end({ prettyPrint: true });
  }

  /**
   * Get the content type for LIDO XML
   * @returns {string} MIME type
   */
  getContentType() {
    return 'application/xml';
  }

  /**
   * Get GND URI for object work type
   * @param {string} id - Object type ID
   * @returns {string} GND URI or empty string
   */
  getObjectWorkTypeURI(id) {
    switch (id) {
      // Kupferstich
      case '010506':
        return 'http://vocab.getty.edu/aat/300041341';

      // Zeichnung
      case '010501':
        return 'http://vocab.getty.edu/aat/300033973';

      // Holzschnitt
      case '010505':
        return 'http://vocab.getty.edu/aat/300041410';

      default:
        return '';
    }
  }
}

module.exports = LidoFormatter;
