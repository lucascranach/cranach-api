/* eslint-disable class-methods-use-this */
const { create } = require('xmlbuilder2');
const BaseFormatter = require('./base-formatter');
const translations = require('../translations');
const {
  getPersonGND,
  getRepositoryID,
  getEventDataByRoleType,
  getMaterialsTechData,
  getObjectWorkTypeURI,
  getClassificationURI,
} = require('../mappings/authority-files');

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
  formatSingleItem(data, language = 'de', options = {}) {
    // New consistent structure: results is always array of {language, data}
    if (Array.isArray(data.results) && data.results.length > 0 && data.results[0].language) {
      return this.buildLidoXmlMultilingual(data.results, language, options);
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
  // eslint-disable-next-line no-unused-vars
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
  buildLidoXmlMultilingual(resultsArray, primaryLanguage = 'de', options = {}) {
    const { imageMetadataMap = {} } = options;

    // Extract data for each language
    const languageData = {};
    resultsArray.forEach((item) => {
      languageData[item.language] = item.data;
    });

    // Use primary language data for main structure
    const primaryData = languageData[primaryLanguage] || resultsArray[0].data;
    const inventoryNumber = primaryData.inventory_number ? primaryData.inventory_number : '';

    // Build dynamic source URL
    const domain = 'https://lucascranach.org';
    const baseUrl = process.env.LIDO_BASE_URL || 'https://lucascranach.org/';
    const sourceUrl = `${baseUrl}/${primaryLanguage}/${inventoryNumber}`;

    // =============================================================================
    // LIDO XML STRUCTURE
    // =============================================================================
    //
    // lido:lido (Root element)
    // │
    // ├─ lido:lidoRecID
    // ├─ lido:objectPublishedID
    // │
    // ├─ lido:descriptiveMetadata (Descriptive metadata)
    // │  │
    // │  ├─ lido:objectClassificationWrap
    // │  │  ├─ lido:objectWorkTypeWrap (Work type: engraving, drawing, etc.)
    // │  │  └─ lido:classificationWrap (Category: drawing, print)
    // │  │
    // │  ├─ lido:objectIdentificationWrap
    // │  │  ├─ lido:titleWrap (Title)
    // │  │  ├─ lido:inscriptionsWrap
    // │  │  │  ├─ lido:inscriptions (Signatures)
    // │  │  │  └─ lido:inscriptions (Markings)
    // │  │  ├─ lido:repositoryWrap
    // │  │  │  ├─ lido:displayRepository (Institution with location)
    // │  │  │  ├─ lido:repositoryName (Institution with GND)
    // │  │  │  ├─ lido:workID (Object identifier)
    // │  │  │  └─ lido:repositoryLocation (Geographic location)
    // │  │  ├─ lido:objectDescriptionWrap
    // │  │  │  ├─ lido:objectDescriptionSet (General description)
    // │  │  │  ├─ lido:objectDescriptionSet (Provenance)
    // │  │  │  └─ lido:objectDescriptionSet (Additional text information)
    // │  │  ├─ lido:objectMeasurementsWrap
    // │  │  │  ├─ lido:objectMeasurementsSet (Sheet measurements)
    // │  │  │  └─ lido:objectMeasurementsSet (Image measurements)
    // │  │  └─ lido:objectMaterialsTechWrap (Material and technique)
    // │  │
    // │  ├─ lido:eventWrap (Events)
    // │  │  └─ lido:eventSet
    // │  │     └─ lido:event (per role type: ARTIST, PRINTER, PRINTMAKER, etc.)
    // │  │        ├─ lido:eventType
    // │  │        ├─ lido:eventActor (Involved persons)
    // │  │        └─ lido:eventDate (Dating)
    // │  │
    // │  └─ lido:objectRelationWrap (Relations to other works)
    // │     └─ lido:relatedWorksWrap
    // │        └─ lido:relatedWorkSet
    // │           ├─ lido:relatedWork
    // │           │  └─ lido:object
    // │           │     ├─ lido:objectID (GND URI)
    // │           │     ├─ lido:objectID (Bartsch catalog number)
    // │           │     └─ lido:objectID (Referenced inventory number)
    // │           └─ lido:relatedWorkRelType (Relationship type)
    // │
    // └─ lido:administrativeMetadata (Administrative metadata)
    //    └─ lido:recordWrap
    //       ├─ lido:recordID
    //       ├─ lido:recordType
    //       └─ lido:recordSource
    //
    // =============================================================================

    const root = create({ version: '1.0', encoding: 'UTF-8' });

    const lido = root.ele('lido:lido', {
      'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      'xmlns:lido': 'http://www.lido-schema.org',
      'xmlns:owl': 'http://www.w3.org/2002/07/owl#',
      'xmlns:rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      'xmlns:gml': 'http://www.opengis.net/gml',
      'xmlns:doc': 'http://www.mda.org.uk/spectrumXML/Documentation',
      'xmlns:sch': 'http://purl.oclc.org/dsdl/schematron',
      'xmlns:skos': 'http://www.w3.org/2004/02/skos/core#',
      'xmlns:tei': 'http://www.tei-c.org/ns/1.0',
      'xmlns:xlink': 'http://www.w3.org/1999/xlink',
      'xmlns:smil20lang': 'http://www.w3.org/2001/SMIL20/Language',
      'xsi:schemaLocation': 'http://www.lido-schema.org https://www.lido-schema.org/schema/v1.1/lido-v1.1.xsd',
    });

    const repositoryData = getRepositoryID(languageData.de.repository);


    // ── lido:lidoRecID ──
    lido.ele('lido:lidoRecID', {
      'lido:type': 'http://terminology.lido-schema.org/lido00100',
      'lido:source': 'https://d-nb.info/gnd/1073160734',
    }).txt(`gnd1073160734/lido/${inventoryNumber}`);

    // TODO isil::DE-MUS-032517::I-43-65
    //      Normdatei::Organisation.::Inventarnummer​
    lido.ele('lido:objectPublishedID', {
      'lido:type': 'http://terminology.lido-schema.org/lido00100',
      'lido:source': 'https://d-nb.info/gnd/1073160734',
    }).txt(`isil::${repositoryData.isil}::${inventoryNumber.split('_').pop()}`);

    // ╔═══════════════════════════════════════════════════════════════════════════╗
    // ║  lido:descriptiveMetadata                                                 ║
    // ╚═══════════════════════════════════════════════════════════════════════════╝
    const descriptiveMetadata = lido.ele('lido:descriptiveMetadata', { 'xml:lang': primaryLanguage });

    // ┌─ lido:objectClassificationWrap ────────────────────────────────────────┐
    const objectClassificationWrap = descriptiveMetadata.ele('lido:objectClassificationWrap');
    //   ├─ lido:objectWorkTypeWrap (Work type)
    const objectWorkTypeWrap = objectClassificationWrap.ele('lido:objectWorkTypeWrap');
    const objectWorkType = objectWorkTypeWrap.ele('lido:objectWorkType',
      { 'lido:type': 'http://terminology.lido-schema.org/lido00789' });

    objectWorkType.ele('lido:conceptID', {
      'lido:type': 'http://terminology.lido-schema.org/lido00099',
    }).txt(getObjectWorkTypeURI(primaryData.objectworktype_id));

    if (languageData.de.objectworktype_value) {
      objectWorkType.ele('lido:term', {
        'xml:lang': 'de',
      }).txt(languageData.de.objectworktype_value);
    }

    if (languageData.en.objectworktype_value) {
      objectWorkType.ele('lido:term', {
        'xml:lang': 'en',
      }).txt(languageData.en.objectworktype_value);
    }

    //   └─ lido:classificationWrap (parent category)
    objectClassificationWrap.ele('lido:classificationWrap')
      .ele('lido:classification', {
        'lido:type': 'http://terminology.lido-schema.org/lido00853',
      })
      .ele('lido:conceptID', {
        'lido:type': 'http://terminology.lido-schema.org/lido00099',
      }).txt(getClassificationURI(languageData.de.classification))
      .up()
      .ele('lido:term', {
        'xml:lang': 'de',
      })
      .txt(languageData.de.classification)
      .up()
      .ele('lido:term', {
        'xml:lang': 'en',
      })
      .txt(languageData.en.classification);
    // └─ lido:objectClassificationWrap──────────────────────────────────┘

    // ┌─ lido:objectIdentificationWrap ────────────────────────────────────────┐
    const objectIdentificationWrap = descriptiveMetadata.ele('lido:objectIdentificationWrap');

    //   ├─ lido:titleWrap
    const titleWrap = objectIdentificationWrap.ele('lido:titleWrap');
    const titleSet = titleWrap.ele('lido:titleSet', {
      'lido:type': 'http://vocab.getty.edu/aat/300417200',
    });

    if (languageData.de.title) {
      titleSet.ele('lido:appellationValue', {
        'lido:pref': 'http://terminology.lido-schema.org/lido00169',
        'xml:lang': 'de',
      }).txt(languageData.de.title);
    }

    if (languageData.en.title) {
      titleSet.ele('lido:appellationValue', {
        'lido:pref': 'http://terminology.lido-schema.org/lido00169',
        'xml:lang': 'en',
      }).txt(languageData.en.title);
    }
    //   └─ End: lido:titleWrap

    //   ├─ lido:inscriptionsWrap
    const inscriptionsWrap = objectIdentificationWrap.ele('lido:inscriptionsWrap');
    //   │  ├─ lido:inscriptions (Signatures)
    inscriptionsWrap.ele('lido:inscriptions', {
      'lido:type': 'http://vocab.getty.edu/aat/300028702',
    })
      .ele('lido:inscriptionDescription')
      .ele('lido:descriptiveNoteValue', {
        'xml:lang': 'de',
      }).txt(this.removeCdaTag(languageData.de.signature))
      .up()
      .ele('lido:descriptiveNoteValue', {
        'xml:lang': 'en',
      })
      .txt(this.removeCdaTag(languageData.en.signature));
    //   │  └─ End: lido:inscriptions (Signatures)

    const inscriptionTranscription = this.extractInscriptionsFromEdition(
      languageData.de.condition, languageData.de.inscription,
    );

    if (inscriptionTranscription) {
      inscriptionsWrap.ele('lido:inscriptions', {
        'lido:type': 'http://vocab.getty.edu/aat/300028702',
      }).ele('lido:inscriptionTranscription', {
        'xml:lang': 'mul',
      }).txt(inscriptionTranscription);
    }
    //   │  └─ End: lido:inscriptionTranscription

    //   │  ├─ lido:inscriptions (Markings)
    const descriptiveNoteValueMarkingsDe = this.extractTextAndCitation(languageData.de.markings);
    const descriptiveNoteValueMarkingsEn = this.extractTextAndCitation(languageData.en.markings);

    inscriptionsWrap.ele('lido:inscriptions', {
      'lido:type': 'http://vocab.getty.edu/aat/300028760',
    })
      .ele('lido:inscriptionDescription')
      .ele('lido:descriptiveNoteID', {
        'lido:type': 'http://terminology.lido-schema.org/lido00099',
      }).txt('http://www.marquesdecollections.fr/detail.cfm/marque/8918')
      .up()
      .ele('lido:descriptiveNoteValue', {
        'xml:lang': 'de',
      })
      .txt(descriptiveNoteValueMarkingsDe.text)
      .up()
      .ele('lido:descriptiveNoteValue', {
        'xml:lang': 'en',
      })
      .txt(descriptiveNoteValueMarkingsEn.text)
      .up()
      .ele('lido:sourceDescriptiveNote')
      .txt(descriptiveNoteValueMarkingsDe.citation);
    //   │  └─ End: lido:inscriptions (Markings)
    //   └─ End: lido:inscriptionsWrap

    //   ├─ lido:repositoryWrap
    const repositoryWrap = objectIdentificationWrap.ele('lido:repositoryWrap');
    const repositoryType = inventoryNumber.includes('-Lost')
      ? 'http://terminology.lido-schema.org/lido01019'
      : 'http://terminology.lido-schema.org/lido01017';

    const repositorySet = repositoryWrap.ele('lido:repositorySet', {
      'lido:type': repositoryType,
    });
    //   │  ├─ lido:displayRepository (Human-readable: "Institution (Location)")
    if (languageData.de.location && languageData.de.location.term) {
      repositorySet.ele('lido:displayRepository', {
        'xml:lang': 'de',
      }).txt(languageData.de.repository
        ? `${languageData.de.repository} (${languageData.de.location.term})`
        : languageData.de.location.term);

      repositorySet.ele('lido:displayRepository', {
        'xml:lang': 'en',
      }).txt(languageData.en.repository
        ? `${languageData.en.repository} (${languageData.de.location.term})`
        : languageData.de.location.term);
    }
    //   │  └─ End: lido:displayRepository

    //   │  ├─ lido:repositoryName (Institution with GND identifier)
    repositorySet.ele('lido:repositoryName')
      .ele('lido:legalBodyID', {
        'lido:type': 'http://terminology.lido-schema.org/lido00099',
      }).txt(repositoryData.repositoryID)
      .up()
      .ele('lido:legalBodyName')
      .ele('lido:appellationValue', {
        'lido:pref': 'http://terminology.lido-schema.org/lido00169',
        'xml:lang': 'de',
      })
      .txt(languageData.de.repository)
      .up()
      .ele('lido:appellationValue', {
        'lido:pref': 'http://terminology.lido-schema.org/lido00169',
        'xml:lang': 'en',
      })
      .txt(languageData.en.repository);
    //   │  └─ End: lido:repositoryName

    //   │  ├─ lido:workID (Object identifier within repository)
    repositorySet.ele('lido:workID', {
      'lido:type': 'http://terminology.lido-schema.org/lido00113',
    }).txt(inventoryNumber.split('_').pop());
    //   │  └─ End: lido:workID

    //   │  ├─ lido:repositoryLocation (Geographic location with GND place identifier)
    if (languageData.de.location
      && (languageData.de.location.url || languageData.de.location.term)) {
      const repositoryLocation = repositorySet.ele('lido:repositoryLocation');

      if (languageData.de.location.url) {
        repositoryLocation.ele('lido:placeID', {
          'lido:type': 'http://terminology.lido-schema.org/lido00099',
        }).txt(languageData.de.location.url);
      }

      const namePlaceSet = repositoryLocation.ele('lido:namePlaceSet');

      if (languageData.de.location.term) {
        namePlaceSet.ele('lido:appellationValue', {
          'lido:pref': 'http://terminology.lido-schema.org/lido00169',
          'xml:lang': 'de',
        }).txt(languageData.de.location.term);
      }

      if (languageData.en && languageData.en.location && languageData.en.location.term) {
        namePlaceSet.ele('lido:appellationValue', {
          'lido:pref': 'http://terminology.lido-schema.org/lido00169',
          'xml:lang': 'en',
        }).txt(languageData.en.location.term);
      }
    }
    //   │  └─ End: lido:repositoryLocation
    //   └─ End: lido:repositoryWrap

    //   ├─ lido:displayStateEditionWrap
    const conditionDe = this.extractTextAndCitation(languageData.de.condition);
    const conditionEn = this.extractTextAndCitation(languageData.en.condition);

    if (conditionDe.text || conditionEn.text) {
      const displayStateEditionWrap = objectIdentificationWrap
        .ele('lido:displayStateEditionWrap');

      // Split by semicolon: "I. Zustand; Auflage a)" -> state and edition
      const splitConditionDe = conditionDe.text.split(';').map((s) => s.trim());
      const splitConditionEn = conditionEn.text.split(';').map((s) => s.trim());

      // displayState (before semicolon)
      if (splitConditionDe[0]) {
        displayStateEditionWrap.ele('lido:displayState', {
          'xml:lang': 'de',
        }).txt(splitConditionDe[0]);
      }

      if (splitConditionEn[0]) {
        displayStateEditionWrap.ele('lido:displayState', {
          'xml:lang': 'en',
        }).txt(splitConditionEn[0]);
      }

      // displayEdition (after semicolon)
      if (splitConditionDe[1]) {
        displayStateEditionWrap.ele('lido:displayEdition', {
          'xml:lang': 'de',
        }).txt(splitConditionDe[1]);
      }

      if (splitConditionEn[1]) {
        displayStateEditionWrap.ele('lido:displayEdition', {
          'xml:lang': 'en',
        }).txt(splitConditionEn[1]);
      }

      // sourceStateEdition
      if (conditionDe.citation !== '') {
        displayStateEditionWrap.ele('lido:sourceStateEdition')
          .txt(conditionDe.citation);
      }
    }
    //   └─ End: lido:displayStateEditionWrap

    //   ├─ lido:objectDescriptionWrap
    const objectDescriptionWrap = objectIdentificationWrap.ele('lido:objectDescriptionWrap');
    //   │  ├─ lido:objectDescriptionSet (general description)
    const objectDescriptionSet = objectDescriptionWrap.ele('lido:objectDescriptionSet');

    // extractTextAndCitation of descriptive_note_value

    const descriptiveNoteValueDe = this.extractTextAndCitation(
      languageData.de.descriptive_note_value,
    );
    const descriptiveNoteValueEn = this.extractTextAndCitation(
      languageData.en.descriptive_note_value,
    );

    if (languageData.de.descriptive_note_value) {
      objectDescriptionSet.ele('lido:descriptiveNoteValue', {
        'xml:lang': 'de',
      }).txt(descriptiveNoteValueDe.text);
    }

    if (languageData.en.descriptive_note_value) {
      objectDescriptionSet.ele('lido:descriptiveNoteValue', {
        'xml:lang': 'en',
      }).txt(descriptiveNoteValueEn.text);
    }

    if (descriptiveNoteValueDe.citation !== '') {
      objectDescriptionSet.ele('lido:sourceDescriptiveNote')
        .txt(descriptiveNoteValueDe.citation);
    }

    //   │  └─ lido:objectDescriptionSet (Provenance)
    const provenanceDescriptionSet = objectDescriptionWrap.ele('lido:objectDescriptionSet', {
      'lido:type': 'http://terminology.lido-schema.org/lido01110',
    });

    if (languageData.de.provenance) {
      provenanceDescriptionSet.ele('lido:descriptiveNoteValue', {
        'xml:lang': 'de',
      }).txt(languageData.de.provenance.replace(/^- /, ''));
    }

    if (languageData.en.provenance) {
      provenanceDescriptionSet.ele('lido:descriptiveNoteValue', {
        'xml:lang': 'en',
      }).txt(languageData.en.provenance);
    }


    //   │  ├─ lido:objectDescriptionSet (Additional text information)
    if (languageData.de.additional_text_information_text
      && languageData.de.additional_text_information_text[0]
      && languageData.de.additional_text_information_text[0].text) {
      const additionalTextInfoDe = this.extractTextAndCitation(
        languageData.de.additional_text_information_text[0].text,
      );

      const additionalTextDescriptionSet = objectDescriptionWrap.ele('lido:objectDescriptionSet');

      additionalTextDescriptionSet.ele('lido:descriptiveNoteValue', {
        'xml:lang': 'de',
      }).txt(additionalTextInfoDe.text);

      if (additionalTextInfoDe.citation !== '') {
        additionalTextDescriptionSet.ele('lido:sourceDescriptiveNote')
          .txt(additionalTextInfoDe.citation);
      }
    }
    //   │  └─ End: lido:objectDescriptionSet (Additional text information)
    //   └─ End: lido:objectDescriptionWrap

    //   ├─ lido:objectMeasurementsWrap
    const objectMeasurementsWrap = objectIdentificationWrap.ele('lido:objectMeasurementsWrap');
    //   │  ├─ lido:objectMeasurementsSet #1 (sheet measurements)
    let objectMeasurementsSet = objectMeasurementsWrap.ele('lido:objectMeasurementsSet');

    if (languageData.de.dimensions) {
      objectMeasurementsSet.ele('lido:displayObjectMeasurements', {
        'xml:lang': 'de',
      }).txt(this.extractTextAndCitation(languageData.de.dimensions).text);
      objectMeasurementsSet.ele('lido:displayObjectMeasurements', {
        'xml:lang': 'en',
      }).txt(this.extractTextAndCitation(languageData.en.dimensions).text);
    }

    objectMeasurementsSet.ele('lido:objectMeasurements')
      .ele('lido:measurementsSet')
      .ele('lido:measurementType')
      .txt('Höhe x Breite')
      .up()
      .ele('lido:measurementUnit')
      .txt('mm')
      .up()
      .ele('lido:measurementValue')
      .txt(this.extractDimensions(languageData.de.dimensions))
      .up()
      .up()
      .ele('lido:extentMeasurements', {
        'xml:lang': 'de',
      })
      .txt('Blatt')
      .up()
      .ele('lido:extentMeasurements', {
        'xml:lang': 'en',
      })
      .txt('sheet');
    //   │  └─ End: lido:objectMeasurementsSet #1

    //   │  ├─ lido:objectMeasurementsSet #2 (image measurements)
    objectMeasurementsSet = objectMeasurementsWrap.ele('lido:objectMeasurementsSet');

    if (languageData.de.dimensions_referenced) {
      objectMeasurementsSet.ele('lido:displayObjectMeasurements', {
        'xml:lang': 'de',
      }).txt(this.extractTextAndCitation(languageData.de.dimensions_referenced).text);
      objectMeasurementsSet.ele('lido:displayObjectMeasurements', {
        'xml:lang': 'en',
      }).txt(this.extractTextAndCitation(languageData.en.dimensions_referenced).text);
    }

    objectMeasurementsSet.ele('lido:objectMeasurements')
      .ele('lido:measurementsSet')
      .ele('lido:measurementType')
      .txt('Höhe x Breite')
      .up()
      .ele('lido:measurementUnit')
      .txt('mm')
      .up()
      .ele('lido:measurementValue')
      .txt(this.extractDimensions(languageData.de.dimensions_referenced))
      .up()
      .up()
      .ele('lido:extentMeasurements', {
        'xml:lang': 'de',
      })
      .txt('Darstellung')
      .up()
      .ele('lido:extentMeasurements', {
        'xml:lang': 'en',
      })
      .txt('image');
    //   │  └─ End: lido:objectMeasurementsSet #2
    //   └─ End: lido:objectMeasurementsWrap

    //   └─ lido:objectMaterialsTechWrap
    const objectMaterialsTechWrap = objectIdentificationWrap.ele('lido:objectMaterialsTechWrap');
    const objectMaterialsTechSet = objectMaterialsTechWrap.ele('lido:objectMaterialsTechSet');

    if (languageData.de.objectworktype_value) {
      objectMaterialsTechSet.ele('lido:displayMaterialsTech', {
        'xml:lang': 'de',
      }).txt(languageData.de.objectworktype_value);
    }

    if (languageData.en.objectworktype_value) {
      objectMaterialsTechSet.ele('lido:displayMaterialsTech', {
        'xml:lang': 'en',
      }).txt(languageData.en.objectworktype_value);
    }

    // Add lido:materialsTech based on objectworktype_value
    const materialsTechData = getMaterialsTechData(languageData.de.objectworktype_value);
    if (materialsTechData) {
      objectMaterialsTechSet.ele('lido:materialsTech')
        .ele('lido:termMaterialsTech', {
          'lido:type': 'http://terminology.lido-schema.org/lido00131',
        })
        .ele('lido:conceptID', {
          'lido:type': 'http://terminology.lido-schema.org/lido0009',
        })
        .txt(materialsTechData.conceptID)
        .up()
        .ele('lido:term', {
          'xml:lang': 'de',
        })
        .txt(materialsTechData.termDe)
        .up()
        .ele('lido:term', {
          'xml:lang': 'en',
        })
        .txt(materialsTechData.termEn);
    }
    //   └─ End: lido:objectMaterialsTechWrap
    // └─ lido:objectIdentificationWrap──────────────────────────────────┘

    // ┌─ lido:eventWrap ───────────────────────────────────────────────────────┐

    const eventWrap = descriptiveMetadata.ele('lido:eventWrap');

    const involvedPersonsReferencedDe = languageData.de.involved_persons_referenced;
    const involvedPersonsReferencedEn = languageData.en.involved_persons_referenced;

    const involvedPersonsDe = languageData.de.involved_persons;
    const involvedPersonsEn = languageData.en.involved_persons;

    // Group PRINTER and PUBLISHER persons from involvedPersons (DE/EN paired by index)
    const involvedPersonsPrinter = [];
    const involvedPersonsPublisher = [];
    involvedPersonsDe.forEach((person, index) => {
      if (person.roleType === 'PRINTER') {
        const personEn = involvedPersonsEn[index];
        involvedPersonsPrinter.push({
          personDe: person,
          personEn: (personEn && personEn.roleType === 'PRINTER') ? personEn : null,
        });
      } else if (person.roleType === 'PUBLISHER') {
        const personEn = involvedPersonsEn[index];
        involvedPersonsPublisher.push({
          personDe: person,
          personEn: (personEn && personEn.roleType === 'PUBLISHER') ? personEn : null,
        });
      }
    });

    // Group persons by role type (ARTIST, PRINTER, PRINTMAKER, etc.)
    const personsByRoleTypeReferenced = {};
    involvedPersonsReferencedDe.forEach((person, index) => {
      const { roleType } = person;
      if (!personsByRoleTypeReferenced[roleType]) {
        personsByRoleTypeReferenced[roleType] = [];
      }
      personsByRoleTypeReferenced[roleType].push({
        personDe: person,
        personEn: involvedPersonsReferencedEn[index] || null,
      });
    });

    if (involvedPersonsPrinter.length > 0) {
      personsByRoleTypeReferenced.PRINTER = involvedPersonsPrinter;
    } else {
      // Ensure PRINTER event exists even without persons
      personsByRoleTypeReferenced.PRINTER = [];
    }

    if (involvedPersonsPublisher.length > 0) {
      personsByRoleTypeReferenced.PUBLISHER = involvedPersonsPublisher;
    } else {
      // Ensure PUBLISHER event exists even without persons
      personsByRoleTypeReferenced.PUBLISHER = [];
    }

    // Determine role type for event date (PRINTER > PRINTMAKER > ARTIST)

    // ** BO Old procedure
    // let eventDateRoleTypeArtist = 'ARTIST';
    // if (personsByRoleTypeReferenced.PRINTER) {
    //   eventDateRoleTypeArtist = 'PRINTER';
    // } else if (personsByRoleTypeReferenced.PRINTMAKER) {
    //   eventDateRoleTypeArtist = 'PRINTMAKER';
    // }
    // ** EO Old procedure

    // Create a separate lido:event element per role type
    Object.keys(personsByRoleTypeReferenced).forEach((roleType) => {
      const persons = personsByRoleTypeReferenced[roleType];
      const eventData = getEventDataByRoleType(roleType);

      //   ├─ lido:event (for role type: ${roleType})
      const eventSet = eventWrap.ele('lido:eventSet');
      const event = eventSet.ele('lido:event');
      //   │  ├─ lido:eventType
      const eventType = event.ele('lido:eventType');
      eventType.ele('lido:conceptID', {
        'lido:type': 'http://terminology.lido-schema.org/lido00099',
        'lido:source': 'http://terminology.lido-schema.org/eventType',
      }).txt(eventData.eventType.conceptID);
      eventType.ele('lido:term', {
        'xml:lang': 'de',
      }).txt(eventData.eventType.termDe);
      eventType.ele('lido:term', {
        'xml:lang': 'en',
      }).txt(eventData.eventType.termEn);

      //   │  ├─ lido:eventActor (for all persons of this role type, if any)
      if (persons.length > 0) {
        persons.forEach(({ personDe, personEn }, personIndex) => {
          const eventActor = event.ele('lido:eventActor');
          eventActor.ele('lido:displayActorInRole', {
            'xml:lang': 'de',
          }).txt(personDe.name);

          if (personEn) {
            eventActor.ele('lido:displayActorInRole', {
              'xml:lang': 'en',
            }).txt(personEn.name);
          }

          const actorInRole = eventActor.ele('lido:actorInRole');
          const actor = actorInRole.ele('lido:actor', {
            'lido:type': 'http://terminology.lido-schema.org/lido00163',
          });
          actor.ele('lido:actorID', {
            'lido:type': 'http://terminology.lido-schema.org/lido00099',
          }).txt(getPersonGND(personDe.name));

          const nameActorSet = actor.ele('lido:nameActorSet');
          nameActorSet.ele('lido:appellationValue', {
            'xml:lang': 'de',
          }).txt(personDe.name);

          if (personEn) {
            nameActorSet.ele('lido:appellationValue', {
              'xml:lang': 'en',
            }).txt(personEn.name);
          }

          const roleActor = actorInRole.ele('lido:roleActor');
          roleActor.ele('lido:conceptID', {
            'lido:type': 'http://terminology.lido-schema.org/lido00099',
          }).txt(eventData.roleActor.conceptID);
          roleActor.ele('lido:term', {
            'xml:lang': 'de',
          }).txt(personDe.role);

          if (personEn) {
            roleActor.ele('lido:term', {
              'xml:lang': 'en',
            }).txt(personEn.role);
          }

          // From second person onwards: attribution qualifier "attributed to"
          if (personIndex > 0) {
            actorInRole.ele('lido:attributionQualifierActor')
              .ele('lido:conceptID', {
                'lido:type': 'http://terminology.lido-schema.org/lido00099',
              }).txt('http://vocab.getty.edu/aat/300404269')
              .up()
              .ele('lido:term', {
                'xml:lang': 'de',
              })
              .txt('zugeschrieben an')
              .up()
              .ele('lido:term', {
                'xml:lang': 'en',
              })
              .txt('attributed to');
          }
        });
      }

      if (roleType === 'INVENTOR' || roleType === 'PRINTER') {
        let eventDateData = {};
        if (roleType === 'INVENTOR') {
          eventDateData = {
            datedDe: languageData.de.date_referenced.dated,
            datedEn: languageData.en.date_referenced.dated,
            begin: languageData.en.date_referenced.begin,
            end: languageData.en.date_referenced.end,
          };
        } else if (roleType === 'PRINTER') {
          eventDateData = {
            datedDe: languageData.de.dating,
            datedEn: languageData.en.dating,
            begin: languageData.en.dating_begin,
            end: languageData.en.dating_end,
          };
        }

        const eventDate = event.ele('lido:eventDate');

        eventDate.ele('lido:displayDate', {
          'xml:lang': 'de',
        }).txt(eventDateData.datedDe);

        eventDate.ele('lido:displayDate', {
          'xml:lang': 'en',
        }).txt(eventDateData.datedEn);

        const date = eventDate.ele('lido:date');

        date.ele('lido:earliestDate', {
          'lido:type': 'http://terminology.lido-schema.org/lido00529',
        }).txt(eventDateData.begin.toString());

        date.ele('lido:latestDate', {
          'lido:type': 'http://terminology.lido-schema.org/lido00529',
        }).txt(eventDateData.end.toString());
      }

      //   │  └─ lido:eventDate (only for the designated role type)

      /* BO Old procedure */
      // if (roleType === eventDateRoleTypeArtist) {
      //   const eventDateDe = languageData.de.date_referenced;
      //   const eventDateEn = languageData.en.date_referenced;

      //   if (eventDateDe) {
      //     // Collect all begin and end dates (incl. historic events)
      //     const beginDates = [eventDateDe.begin];
      //     const endDates = [eventDateDe.end];

      //     const historicEvents = eventDateDe.historicEventInformations;
      //     if (Array.isArray(historicEvents)) {
      //       historicEvents.forEach((info) => {
      //         if (info.begin) beginDates.push(info.begin);
      //         if (info.end) endDates.push(info.end);
      //       });
      //     }

      //     // Determine earliest and latest date
      //     const validBeginDates = beginDates.filter((d) => d != null && !Number.isNaN(d));
      //     const validEndDates = endDates.filter((d) => d != null && !Number.isNaN(d));
      //     const earliestDate = validBeginDates.length > 0 ? Math.min(...validBeginDates) : null;
      //     const latestDate = validEndDates.length > 0 ? Math.max(...validEndDates) : null;

      //     // Build displayDate string (German)
      //     let displayDateDe = '';
      //     if (eventDateDe.dated) {
      //       displayDateDe = eventDateDe.dated;
      //       if (eventDateDe.remarks) {
      //         displayDateDe += ` ${eventDateDe.remarks}`;
      //       }
      //     }

      //     if (Array.isArray(historicEvents)) {
      //       historicEvents.forEach((info) => {
      //         if (info.text) {
      //           if (displayDateDe) displayDateDe += ', ';
      //           displayDateDe += info.text;
      //           if (info.remarks) {
      //             displayDateDe += ` ${info.remarks}`;
      //           }
      //         }
      //       });
      //     }

      //     // Build displayDate string (English)
      //     let displayDateEn = '';
      //     if (eventDateEn.dated) {
      //       displayDateEn = eventDateEn.dated;
      //       if (eventDateEn.remarks) {
      //         displayDateEn += ` ${eventDateEn.remarks}`;
      //       }
      //     }

      //     if (Array.isArray(eventDateEn.historicEventInformations)) {
      //       eventDateEn.historicEventInformations.forEach((info) => {
      //         if (info.text) {
      //           if (displayDateEn) displayDateEn += ', ';
      //           displayDateEn += info.text;
      //           if (info.remarks) {
      //             displayDateEn += ` ${info.remarks}`;
      //           }
      //         }
      //       });
      //     }

      //     const eventDate = event.ele('lido:eventDate');

      //     if (displayDateDe) {
      //       eventDate.ele('lido:displayDate', {
      //         'xml:lang': 'de',
      //       }).txt(displayDateDe);
      //     }

      //     if (displayDateEn) {
      //       eventDate.ele('lido:displayDate', {
      //         'xml:lang': 'en',
      //       }).txt(displayDateEn);
      //     }

      //     // Structured date with earliestDate/latestDate
      //     if (earliestDate !== null || latestDate !== null) {
      //       const date = eventDate.ele('lido:date');

      //       if (earliestDate !== null) {
      //         date.ele('lido:earliestDate', {
      //           'lido:type': 'http://terminology.lido-schema.org/lido00529',
      //         }).txt(earliestDate.toString());
      //       }

      //       if (latestDate !== null) {
      //         date.ele('lido:latestDate', {
      //           'lido:type': 'http://terminology.lido-schema.org/lido00529',
      //         }).txt(latestDate.toString());
      //       }
      //     }
      //   }
      // }

      /* EO Old procedure */
    });
    // └─ lido:eventWrap─────────────────────────────────────────────────┘

    // ┌─ lido:objectRelationWrap ──────────────────────────────────────────────┐
    const relatedWorksWrap = descriptiveMetadata.ele('lido:objectRelationWrap')
      .ele('lido:relatedWorksWrap');

    //   ├─ lido:relatedWorkSet
    const relatedWorkSet = relatedWorksWrap.ele('lido:relatedWorkSet');

    //   │  ├─ lido:relatedWork
    relatedWorkSet.ele('lido:relatedWork')
      .ele('lido:object')
      .ele('lido:objectID', {
        'lido:type': 'http://terminology.lido-schema.org/lido00099',
      })
      .txt(this.getCatalogReference(languageData.de.catalog_work_references, 'GND'))
      .up()
      .ele('lido:objectID', {
        'lido:type': 'http://terminology.lido-schema.org/lido00100',
        'lido:source': 'https://d-nb.info/gnd/4405115-3',
      })
      .txt(`Bartsch ${this.getCatalogReference(languageData.de.catalog_work_references, 'Bartsch')}`)
      .up()
      .ele('lido:objectID', {
        'lido:type': 'http://terminology.lido-schema.org/lido00100',
        'lido:source': `${domain}`,
      })
      .txt(`${languageData.de.inventory_number_referenced}`);
    //   │  └─ End: lido:relatedWork

    //   │  ├─ lido:relatedWorkRelType
    relatedWorkSet.ele('lido:relatedWorkRelType')
      .ele('skos:Concept', {
        'rdf:about': 'http://terminology.lido-schema.org/lido00627',
      })
      .ele('skos:prefLabel', {
        'xml:lang': 'de',
      })
      .txt('ist Exemplar von')
      .up()
      .ele('skos:prefLabel', {
        'xml:lang': 'en',
      })
      .txt('is example of');

    languageData.de.publications.forEach((publication) => {
      relatedWorksWrap.ele('lido:relatedWorkSet')
        .ele('lido:relatedWork')
        .ele('lido:object')
        .ele('lido:objectNote')
        .txt(`${publication.authors}, ${publication.title}, ${publication.publish_location}, ${publication.publish_date}, S. ${publication.pageNumber}`)
        .up()
        .up()
        .up()
        .ele('lido:relatedWorkRelType')
        .ele('lido:conceptID', {
          'lido:type': 'http://terminology.lido-schema.org/lido00099',
        })
        .txt('http://terminology.lido-schema.org/lido00617')
        .up()
        .ele('lido:term', {
          'xml:lang': 'de',
        })
        .txt('ist dokumentiert in')
        .up()
        .ele('lido:term', {
          'xml:lang': 'en',
        })
        .txt('is documented in');
    });

    //   ├─ lido:relatedWorkSet (related in content)
    if (languageData.de.related_in_content_to && languageData.de.related_in_content_to.length > 0) {
      const relatedWork = languageData.de.related_in_content_to[0];
      const relatedTitle = relatedWork.title || 'nicht vorhanden';

      relatedWorksWrap.ele('lido:relatedWorkSet')
        .ele('lido:relatedWork')
        .ele('lido:object')
        .ele('lido:objectWebResource')
        .txt(`${baseUrl}${primaryLanguage}/${relatedWork.inventoryNumber}`)
        .up()
        .ele('lido:objectNote')
        .txt(relatedTitle)
        .up()
        .up()
        .up()
        .ele('lido:relatedWorkRelType')
        .ele('lido:conceptID', {
          'lido:type': 'http://terminology.lido-schema.org/lido00099',
        })
        .txt('http://terminology.lido-schema.org/lido00263')
        .up()
        .ele('lido:term', {
          'xml:lang': 'de',
        })
        .txt('hat Bezug zu')
        .up()
        .ele('lido:term', {
          'xml:lang': 'en',
        })
        .txt('is related to');
    }
    //   └─ End: lido:relatedWorkSet (related in content)
    // └─ lido:objectRelationWrap─────────────────────────────────────────┘

    // ╔═══════════════════════════════════════════════════════════════════════════╗
    // ║  lido:administrativeMetadata                                              ║
    // ╚═══════════════════════════════════════════════════════════════════════════╝
    const administrativeMetadata = lido.ele('lido:administrativeMetadata', { 'xml:lang': primaryLanguage });

    // ┌─ lido:rightsWorkWrap ──────────────────────────────────────────────────┐
    const rightsWorkWrap = administrativeMetadata.ele('lido:rightsWorkWrap');
    const rightsWorkSet = rightsWorkWrap.ele('lido:rightsWorkSet');
    //   ├─ lido:rightsType (Specific information about rights)
    rightsWorkSet.ele('lido:rightsType', {
      'lido:type': 'http://terminology.lido-schema.org/lido00921',
    })
      .ele('skos:Concept', {
        'rdf:about': 'http://creativecommons.org/publicdomain/mark/1.0/',
      })
      .ele('skos:prefLabel', {
        'xml:lang': 'de',
      })
      .txt('Kein Urheberrechtsschutz')
      .up()
      .ele('skos:prefLabel', {
        'xml:lang': 'en',
      })
      .txt('No Copyright');
    //   └─ End: lido:rightsType

    //   ├─ lido:creditLine
    rightsWorkSet.ele('lido:creditLine')
      .txt('gemeinfrei');
    //   └─ End: lido:creditLine
    // └─ lido:rightsWorkWrap─────────────────────────────────────────────────┘

    // ┌─ lido:recordWrap ──────────────────────────────────────────────────────┐
    const recordWrap = administrativeMetadata.ele('lido:recordWrap');
    //   ├─ lido:recordID
    recordWrap
      .ele('lido:recordID', {
        'lido:type': 'http://terminology.lido-schema.org/lido00100',
      }).txt(`${inventoryNumber}/record`);
    //   └─ End: lido:recordID

    //   ├─ lido:recordType
    const recordType = recordWrap.ele('lido:recordType');
    recordType.ele('lido:conceptID', {
      'lido:type': 'http://terminology.lido-schema.org/lido00099',
    }).txt('http://terminology.lido-schema.org/lido00141');

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
    //   └─ End: lido:recordType

    //   ├─ lido:recordSource
    const recordSource = recordWrap.ele('lido:recordSource');
    recordSource.ele('lido:legalBodyID', {
      'lido:type': 'http://terminology.lido-schema.org/lido00099',
    }).txt('https://d-nb.info/gnd/1073160734');
    recordSource.ele('lido:legalBodyName').ele('lido:appellationValue').txt('Cranach Digital Archive');
    recordSource
      .ele('lido:legalBodyWeblink')
      .txt(`${domain}`);
    //   └─ End: lido:recordSource
    // └─ lido:recordWrap─────────────────────────────────────────────────────┘

    recordWrap.ele('lido:recordRights')
      .ele('lido:rightsType', {
        'lido:type': 'http://terminology.lido-schema.org/lido00921',
      })
      .ele('skos:Concept', {
        'rdf:about': 'http://creativecommons.org/publicdomain/zero/1.0/',
      })
      .ele('skos:prefLabel', {
        'xml:lang': 'de',
      })
      .txt('CC0 1.0 Universell Public Domain Dedication')
      .up()
      .ele('skos:prefLabel', {
        'xml:lang': 'en',
      })
      .txt('CC0 1.0 Universal Public Domain Dedication');

    recordWrap.ele('lido:recordInfoSet', {
      'lido:type': 'http://terminology.lido-schema.org/lido00471',
    }).ele('lido:recordInfoLink')
      .txt(`${sourceUrl}`);

    // ┌─ lido:resourceWrap ────────────────────────────────────────────────────┐
    const resourceWrap = administrativeMetadata.ele('lido:resourceWrap');

    // Map category keys to German descriptions
    const categoryDescriptions = {
      overall: 'Gesamtansicht',
      detail: 'Detailansicht',
      conservation: 'Restaurierungsaufnahme',
      irr: 'Infrarotaufnahme',
      photomicrograph: 'Mikroskopaufnahme',
      reverse: 'Rückseitenaufnahme',
      transmitted_light: 'Durchlichtaufnahme',
      uv_light: 'UV-Flureszenzaufnahme',
      other: 'Weitere Ansicht',
    };

    // Process all images from all categories
    const allImagesWithCategory = [];
    const imageCategories = languageData.de.images || {};
    Object.keys(imageCategories).forEach((categoryKey) => {
      const category = imageCategories[categoryKey];
      if (category && category.images && Array.isArray(category.images)) {
        category.images.forEach((image) => {
          allImagesWithCategory.push({
            ...image,
            category: categoryKey,
          });
        });
      }
    });

    // Create a resourceSet for each image
    allImagesWithCategory.forEach((imageWithCategory) => {
      const image = imageWithCategory;
      //   ├─ lido:resourceSet (per image)
      const resourceSet = resourceWrap.ele('lido:resourceSet');

      //   │  ├─ lido:resourceID
      resourceSet.ele('lido:resourceID', {
        'lido:type': 'http://terminology.lido-schema.org/lido00100',
      }).txt(image.id);

      //   │  ├─ lido:resourceRepresentation (thumbnail)
      if (image.sizes.small) {
        const thumbRepresentation = resourceSet.ele('lido:resourceRepresentation', {
          'lido:type': 'http://terminology.lido-schema.org/lido00451',
        });
        //   │  │  ├─ lido:linkResource
        thumbRepresentation.ele('lido:linkResource', {
          'lido:formatResource': 'image/jpeg',
        }).txt(image.sizes.small.src);

        //   │  │  └─ lido:resourceMeasurementsSet (width in pixels)
        const thumbMeasurements = thumbRepresentation.ele('lido:resourceMeasurementsSet');
        thumbMeasurements.ele('lido:measurementType')
          .ele('skos:Concept', {
            'rdf:about': 'http://www.wikidata.org/wiki/Q35059',
          })
          .ele('skos:prefLabel', {
            'xml:lang': 'en',
          }).txt('width')
          .up()
          .ele('skos:prefLabel', {
            'xml:lang': 'de',
          })
          .txt('Breite')
          .up()
          .ele('skos:mappingRelation')
          .txt('http://vocab.getty.edu/aat/300055647');

        thumbMeasurements.ele('lido:measurementUnit')
          .ele('skos:Concept', {
            'rdf:about': 'http://www.wikidata.org/wiki/Q355198',
          })
          .ele('skos:prefLabel', {
            'xml:lang': 'en',
          })
          .txt('pixel')
          .up()
          .ele('skos:prefLabel', {
            'xml:lang': 'de',
          })
          .txt('Pixel')
          .up()
          .ele('skos:mappingRelation')
          .txt('http://vocab.getty.edu/aat/300266190');

        thumbMeasurements.ele('lido:measurementValue')
          .txt(image.sizes.small.dimensions.width.toString());
      }

      //   │  ├─ lido:resourceRepresentation (high-resolution)
      if (image.sizes.origin) {
        const highresRepresentation = resourceSet.ele('lido:resourceRepresentation', {
          'lido:type': 'http://terminology.lido-schema.org/lido00464',
        });
        //   │  │  ├─ lido:linkResource
        highresRepresentation.ele('lido:linkResource', {
          'lido:formatResource': 'image/jpeg',
        }).txt(image.sizes.origin.src);

        //   │  │  └─ lido:resourceMeasurementsSet (width in pixels)
        const highresMeasurements = highresRepresentation.ele('lido:resourceMeasurementsSet');
        highresMeasurements.ele('lido:measurementType')
          .ele('skos:Concept', {
            'rdf:about': 'http://www.wikidata.org/wiki/Q35059',
          })
          .ele('skos:prefLabel', {
            'xml:lang': 'en',
          })
          .txt('width')
          .up()
          .ele('skos:prefLabel', {
            'xml:lang': 'de',
          })
          .txt('Breite')
          .up()
          .ele('skos:mappingRelation')
          .txt('http://vocab.getty.edu/aat/300055647');

        highresMeasurements.ele('lido:measurementUnit')
          .ele('skos:Concept', {
            'rdf:about': 'http://www.wikidata.org/wiki/Q355198',
          })
          .ele('skos:prefLabel', {
            'xml:lang': 'en',
          })
          .txt('pixel')
          .up()
          .ele('skos:prefLabel', {
            'xml:lang': 'de',
          })
          .txt('Pixel')
          .up()
          .ele('skos:mappingRelation')
          .txt('http://vocab.getty.edu/aat/300266190');

        highresMeasurements.ele('lido:measurementValue')
          .txt(image.sizes.origin.dimensions.width.toString());
      }

      //   │  ├─ lido:resourceType (digital image)
      resourceSet.ele('lido:resourceType')
        .ele('skos:Concept', {
          'rdf:about': 'http://vocab.getty.edu/aat/300215302',
        })
        .ele('skos:prefLabel', {
          'xml:lang': 'en',
        })
        .txt('digital images')
        .up()
        .ele('skos:altLabel', {
          'xml:lang': 'en',
        })
        .txt('digital image')
        .up()
        .up()
        .ele('lido:term')
        .txt('Digitales Bild')
        .up()
        .ele('lido:term', {
          'lido:addedSearchTerm': 'yes',
        })
        .txt('Digitalbild');

      //   │  ├─ lido:resourceDescription (category-specific description)
      const categoryDescription = categoryDescriptions[image.category] || 'Weitere Ansicht';
      resourceSet.ele('lido:resourceDescription')
        .txt(categoryDescription);

      //   │  ├─ lido:resourceSource
      const imageMetadata = imageMetadataMap[image.id] || {};
      resourceSet.ele('lido:resourceSource')
        .ele('lido:legalBodyID', {
          'lido:type': 'http://terminology.lido-schema.org/lido00099',
        })
        .txt('{{PLACEHOLDER_WIKIDATA_URI}}')
        .up()
        .ele('lido:legalBodyName')
        .ele('lido:appellationValue')
        .txt('{{PLACEHOLDER_INSTITUTION_NAME}}');

      //   │  └─ lido:rightsResource
      resourceSet.ele('lido:rightsResource')
        .ele('lido:rightsType', {
          'lido:type': 'http://terminology.lido-schema.org/lido00921',
        })
        .ele('skos:Concept', {
          'rdf:about': 'http://creativecommons.org/publicdomain/mark/1.0/',
        })
        .ele('skos:prefLabel', {
          'xml:lang': 'de',
        })
        .txt('Kein Urheberrechtsschutz')
        .up()
        .ele('skos:prefLabel', {
          'xml:lang': 'en',
        })
        .txt('No Copyright')
        .up()
        .up()
        .up()
        .ele('lido:rightsHolder')
        .ele('lido:legalBodyID', {
          'lido:type': 'http://terminology.lido-schema.org/lido00099',
        })
        .txt('https://d-nb.info/gnd/1073160734')
        .up()
        .ele('lido:legalBodyName')
        .ele('lido:appellationValue')
        .txt('Cranach Digital Archive')
        .up()
        .up()
        .up()
        .ele('lido:creditLine')
        .txt('Cranach Digital Archive');
    });
    // └─ lido:resourceWrap───────────────────────────────────────────────────┘

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
   * Remove the substring '\n[cda 2026]' from the end of a string
   * @param {string} text - The input string
   * @returns {string} The cleaned string
   */
  removeCdaTag(text) {
    if (!text) return text;
    return text.replace(/\n\[cda 2026\]$/, '');
  }

  /**
   * Extract dimensions from a string starting with any word followed by a colon
   * @param {string} text - The input string
   *   (e.g., "Blatt: 277 x 190 mm, Darstellung: 282-284 x 194-202 mm")
   * @returns {string} The extracted dimensions without unit
   *   (e.g., "277 x 190" or "282-284 x 194-202")
   */
  extractDimensions(text) {
    if (!text) return '';
    const match = text.match(/\w+:\s*([\d-]+\s*x\s*[\d-]+)/i);
    return match ? match[1] : '';
  }

  /**
   * Get catalog reference by description
   * @param {Array} catalogWorkReferences - Array of catalog reference objects
   * @param {string} description - The description to search for (e.g., 'Bartsch')
   * @returns {string} The formatted catalog reference or empty string if not found
   */
  getCatalogReference(catalogWorkReferences, description) {
    if (!Array.isArray(catalogWorkReferences)) return '';
    const catalogWorkReference = catalogWorkReferences.find(
      (ref) => ref.description === description,
    );
    if (!catalogWorkReference) {
      return '';
    }
    return `${catalogWorkReference.referenceNumber}`;
  }

  /**
   * Extract text and citation from a string
   * @param {string} text - The input string with citation in square brackets at the end
   * @returns {Object} Object with 'text' and 'citation' properties
   * @example
   * // Input: "Some text about art.\n[Exhib Cat. Düsseldorf 2017, 109, no. 7]"
   * // Output: { text: "Some text about art.", citation: "Exhib Cat. Düsseldorf 2017, 109, no. 7" }
   */
  extractTextAndCitation(text) {
    if (!text) return { text: '', citation: '' };

    // Match optional newline/whitespace, then [content] at the end
    const match = text.match(/^(.*?)\s*\n?\s*\[([^\]]+)\]\s*$/s);

    if (match) {
      return {
        text: match[1].trim(),
        citation: match[2].trim(),
      };
    }

    // No citation found, return entire text
    return {
      text: text.trim(),
      citation: '',
    };
  }

  /**
   * Extract inscriptions up to and including the specified edition
   * @param {string} condition - Condition string (e.g., "I. Zustand; Auflage e)")
   * @param {string} inscription - Inscription string with multiple editions
   * @returns {string} All inscriptions from the beginning up to and including the specified edition
   * @example
   * // condition: "I. Zustand; Auflage e)"
   * // inscription: "Auflage d)\n...\n\nAuflage e)\n...\n\nAuflage g)\n..."
   * // Returns: "Auflage d)\n...\n\nAuflage e)\n..."
   */
  extractInscriptionsFromEdition(condition, inscription) {
    if (!condition || !inscription) return inscription || '';

    // Extract edition letter from condition (e.g., "e" from "Auflage e)")
    const conditionMatch = condition.match(/Auflage ([a-z])\)/i);
    if (!conditionMatch) {
      return inscription; // No edition found in condition, return full inscription
    }

    const conditionLetter = conditionMatch[1].toLowerCase();

    // Find all editions in the inscription text
    const editionPattern = /\bAuflage ([a-z])\)/gi;
    let match;
    let firstExcludedEditionIndex = -1;

    // Search for the first edition that is HIGHER than the condition edition
    // eslint-disable-next-line no-cond-assign
    while ((match = editionPattern.exec(inscription)) !== null) {
      const foundLetter = match[1].toLowerCase();

      // If this edition is after the condition edition alphabetically, mark it for exclusion
      if (foundLetter > conditionLetter) {
        firstExcludedEditionIndex = match.index;
        break;
      }
    }

    // If we found an edition to exclude, cut off everything from that point
    let result = inscription;
    if (firstExcludedEditionIndex !== -1) {
      result = inscription.substring(0, firstExcludedEditionIndex).trim();
    }

    // Remove all "Auflage x)" lines from the result
    result = result.replace(/^Auflage [a-z]\)\s*\n?/gim, '');

    return result.trim();
  }

  /**
   * Extract all image IDs from images object
   * @param {Object} images - Images object with arbitrary section names
   * @returns {Array<string>} Array of image IDs
   * @example
   * // Returns: ['G_DE_KSVC_I-43-65_Overall', 'G_DE_KSVC_I-43-65_Overall-001']
   */
  extractImageIds(images) {
    const imageIds = [];

    if (!images || typeof images !== 'object') {
      return imageIds;
    }

    // Iterate over all sections (overall, other, or any other name)
    Object.keys(images).forEach((sectionKey) => {
      const section = images[sectionKey];

      // Check if this section has an images array
      if (section && section.images && Array.isArray(section.images)) {
        section.images.forEach((image) => {
          imageIds.push(image.id);
        });
      }
    });

    return imageIds;
  }
}

module.exports = LidoFormatter;
