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
    // │  │  │  ├─ lido:objectDescriptionSet (Footnotes, lido:type="Anmerkung")
    // │  │  │  ├─ lido:objectDescriptionSet (Sources, lido:type="Quellen")
    // │  │  │  ├─ lido:objectDescriptionSet (Provenance)
    // │  │  │  └─ lido:objectDescriptionSet (Additional text information)
    // │  │  ├─ lido:objectMeasurementsWrap
    // │  │  │  └─ lido:objectMeasurementsSet (per dimension pair)
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
    const isLost = inventoryNumber.includes('-Lost');

    // ── lido:lidoRecID ──
    lido.ele('lido:lidoRecID', {
      'lido:type': 'http://terminology.lido-schema.org/lido00100',
      'lido:source': 'https://d-nb.info/gnd/1073160734',
    }).txt(`gnd1073160734/lido/${inventoryNumber}`);

    const publishedIDSource = isLost && languageData.de.owner
      ? getRepositoryID(languageData.de.owner)
      : repositoryData;
    const publishedIDValue = publishedIDSource.gnd || publishedIDSource.isil || 'unbekannt';
    const publishedIDType = publishedIDSource.gnd ? 'gnd' : 'isil';
    lido.ele('lido:objectPublishedID', {
      'lido:type': 'http://terminology.lido-schema.org/lido00100',
      'lido:source': 'https://d-nb.info/gnd/1073160734',
    // Normdatei::Organisation.::Inventarnummer​
    }).txt(`${publishedIDType}::${publishedIDValue}::${inventoryNumber.split('_').slice(2).join('_')}`);

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

    //   └─ lido:classificationWrap (parent category, skip for drawings)
    if (languageData.de.classification !== 'Zeichnung') {
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
    }
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
      'lido:type': 'http://vocab.getty.edu/aat/300028705',
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

    //   │  ├─ lido:inscriptions (Markings - one element per collector's mark)    
    const markingsEntries = this.parseMarkingsEntries(
      languageData.de.markings,
      languageData.en.markings,
    );

    markingsEntries.forEach((entry) => {
      const inscriptionDescription = inscriptionsWrap.ele('lido:inscriptions', {
        'lido:type': 'http://vocab.getty.edu/aat/300028760',
      }).ele('lido:inscriptionDescription');

      if (entry.url) {
        inscriptionDescription.ele('lido:descriptiveNoteID', {
          'lido:type': 'http://terminology.lido-schema.org/lido00099',
        }).txt(entry.url);
      }

      if (entry.textDe) {
        inscriptionDescription.ele('lido:descriptiveNoteValue', {
          'xml:lang': 'de',
        }).txt(entry.textDe);
      }

      if (entry.textEn) {
        inscriptionDescription.ele('lido:descriptiveNoteValue', {
          'xml:lang': 'en',
        }).txt(entry.textEn);
      }

      if (entry.citation) {
        inscriptionDescription.ele('lido:sourceDescriptiveNote').txt(entry.citation);
      }
    });
    //   │  └─ End: lido:inscriptions (Markings)
    //   └─ End: lido:inscriptionsWrap

    //   ├─ lido:repositoryWrap
    const repositoryWrap = objectIdentificationWrap.ele('lido:repositoryWrap');

    const repositorySet = repositoryWrap.ele('lido:repositorySet', {
      'lido:type': 'http://terminology.lido-schema.org/lido01017',
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
    const repositoryName = repositorySet.ele('lido:repositoryName');

    if (!isLost) {
      repositoryName.ele('lido:legalBodyID', {
        'lido:type': 'http://terminology.lido-schema.org/lido00099',
      }).txt(repositoryData.repositoryID);
    }

    repositoryName.ele('lido:legalBodyName')
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
    const lostArtUrl = isLost
      ? this.extractLostArtUrlFromProvenance(languageData.de.provenance)
      : '';

    if (!isLost || lostArtUrl) {
      const repositoryWorkIdType = isLost
        ? 'Lost Art ID'
        : 'http://terminology.lido-schema.org/lido00113';
      const repositoryWorkIdValue = isLost
        ? lostArtUrl
        : inventoryNumber.split('_').slice(2).join('_');

      repositorySet.ele('lido:workID', {
        'lido:type': repositoryWorkIdType,
      }).txt(repositoryWorkIdValue);
    }
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

    //   │  ├─ lido:repositorySet (former owner, only for lost works)
    if (isLost && languageData.de.owner) {
      const ownerData = getRepositoryID(languageData.de.owner);
      const ownerRepositorySet = repositoryWrap.ele('lido:repositorySet', {
        'lido:type': 'http://terminology.lido-schema.org/lido01019',
      });

      const ownerRepositoryName = ownerRepositorySet.ele('lido:repositoryName');

      if (ownerData && ownerData.repositoryID) {
        ownerRepositoryName.ele('lido:legalBodyID', {
          'lido:type': 'http://terminology.lido-schema.org/lido00099',
        }).txt(ownerData.repositoryID);
      }

      ownerRepositoryName.ele('lido:legalBodyName')
        .ele('lido:appellationValue', {
          'lido:pref': 'http://terminology.lido-schema.org/lido00169',
          'xml:lang': 'de',
        })
        .txt(languageData.de.owner)
        .up()
        .ele('lido:appellationValue', {
          'lido:pref': 'http://terminology.lido-schema.org/lido00169',
          'xml:lang': 'en',
        })
        .txt(languageData.en.owner || languageData.de.owner);

      ownerRepositorySet.ele('lido:workID', {
        'lido:type': 'http://terminology.lido-schema.org/lido00113',
      }).txt(inventoryNumber.split('_').slice(2).join('_'));
    }
    //   │  └─ End: lido:repositorySet (former owner)
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

    // extractTextAndCitation of descriptive_note_value

    const descriptiveNoteValueDe = this.extractTextAndCitation(
      languageData.de.descriptive_note_value,
    );
    const descriptiveNoteValueEn = this.extractTextAndCitation(
      languageData.en.descriptive_note_value,
    );

    const splitDe = this.splitDescriptiveNote(descriptiveNoteValueDe.text);
    const splitEn = this.splitDescriptiveNote(descriptiveNoteValueEn.text);

    //   │  ├─ lido:objectDescriptionSet (general description - one per paragraph)
    const deParagraphs = splitDe.description
      ? splitDe.description.split(/\n\n+/).map(p => p.trim()).filter(p => p)
      : [];
    const enParagraphs = splitEn.description
      ? splitEn.description.split(/\n\n+/).map(p => p.trim()).filter(p => p)
      : [];

    const paragraphCount = Math.max(deParagraphs.length, enParagraphs.length, 1);

    for (let i = 0; i < paragraphCount; i++) {
      const objectDescriptionSet = objectDescriptionWrap.ele('lido:objectDescriptionSet');

      if (deParagraphs[i]) {
        objectDescriptionSet.ele('lido:descriptiveNoteValue', {
          'xml:lang': 'de',
        }).txt(deParagraphs[i]);
      }

      if (enParagraphs[i]) {
        objectDescriptionSet.ele('lido:descriptiveNoteValue', {
          'xml:lang': 'en',
        }).txt(enParagraphs[i]);
      }

      if (i === 0 && descriptiveNoteValueDe.citation !== '') {
        objectDescriptionSet.ele('lido:sourceDescriptiveNote')
          .txt(descriptiveNoteValueDe.citation);
      }
    }

    //   │  ├─ lido:objectDescriptionSet (Footnotes / Anmerkungen)
    if (splitDe.footnotes || splitEn.footnotes) {
      const deAnnotations = this.parseAnnotations(splitDe.footnotes);
      const enAnnotations = this.parseAnnotations(splitEn.footnotes);

      const deMap = new Map(deAnnotations.map(a => [a.number, a]));
      const enMap = new Map(enAnnotations.map(a => [a.number, a]));
      const allNumbers = [...new Set([...deMap.keys(), ...enMap.keys()])].sort((a, b) => a - b);

      if (allNumbers.length > 0) {
        for (const num of allNumbers) {
          const deAnnotation = deMap.get(num);
          const enAnnotation = enMap.get(num);
          const rawText = (deAnnotation || enAnnotation).rawText;
          const numMatch = rawText.match(/^\[(\d+)\]/);
          const typeLabel = numMatch ? `Anm. ${numMatch[1]}` : 'Anmerkung';

          const annotationSet = objectDescriptionWrap.ele('lido:objectDescriptionSet', {
            'lido:type': typeLabel,
          });

          if (deAnnotation) {
            annotationSet.ele('lido:descriptiveNoteValue', { 'xml:lang': 'de' }).txt(deAnnotation.text);
          }
          if (enAnnotation) {
            annotationSet.ele('lido:descriptiveNoteValue', { 'xml:lang': 'en' }).txt(enAnnotation.text);
          }
        }
      } else {
        const footnotesDescriptionSet = objectDescriptionWrap.ele('lido:objectDescriptionSet', {
          'lido:type': 'Anmerkung',
        });

        if (splitDe.footnotes) {
          footnotesDescriptionSet.ele('lido:descriptiveNoteValue', { 'xml:lang': 'de' }).txt(splitDe.footnotes);
        }
        if (splitEn.footnotes) {
          footnotesDescriptionSet.ele('lido:descriptiveNoteValue', { 'xml:lang': 'en' }).txt(splitEn.footnotes);
        }
      }
    }

    //   │  ├─ lido:objectDescriptionSet (Additional text information / Forschungsgeschichte)
    if (languageData.de.additional_text_information_text
      && languageData.de.additional_text_information_text.length > 0) {
      languageData.de.additional_text_information_text.forEach((item) => {
        if (!item.text) return;

        const additionalTextInfoDe = this.extractTextAndCitation(item.text);

        const additionalTextDescriptionSet = objectDescriptionWrap.ele('lido:objectDescriptionSet', {
          'lido:type': 'Forschungsgeschichte',
        });

        additionalTextDescriptionSet.ele('lido:descriptiveNoteValue', {
          'xml:lang': 'de',
        }).txt(additionalTextInfoDe.text);

        if (additionalTextInfoDe.citation !== '') {
          additionalTextDescriptionSet.ele('lido:sourceDescriptiveNote')
            .txt(additionalTextInfoDe.citation);
        }
      });
    }

    //   │  ├─ lido:objectDescriptionSet (Sources / Quellen)
    if (splitDe.sources || splitEn.sources) {
      const sourcesDescriptionSet = objectDescriptionWrap.ele('lido:objectDescriptionSet', {
        'lido:type': 'Quellen',
      });

      if (splitDe.sources) {
        sourcesDescriptionSet.ele('lido:descriptiveNoteValue', {
          'xml:lang': 'de',
        }).txt(splitDe.sources);
      }

      if (splitEn.sources) {
        sourcesDescriptionSet.ele('lido:descriptiveNoteValue', {
          'xml:lang': 'en',
        }).txt(splitEn.sources);
      }
    }


    //   │  └─ lido:objectDescriptionSet (Provenance)
    const provenanceDe = this.extractTextAndCitation(languageData.de.provenance);
    const provenanceEn = this.extractTextAndCitation(languageData.en.provenance);

    if (languageData.de.provenance || languageData.en.provenance || provenanceDe.citation !== '') {
      const provenanceDescriptionSet = objectDescriptionWrap.ele('lido:objectDescriptionSet', {
        'lido:type': 'http://terminology.lido-schema.org/lido01110',
      });

      if (languageData.de.provenance) {
        provenanceDescriptionSet.ele('lido:descriptiveNoteValue', {
          'xml:lang': 'de',
        }).txt(provenanceDe.text.replace(/^- /, ''));
      }

      if (languageData.en.provenance) {
        provenanceDescriptionSet.ele('lido:descriptiveNoteValue', {
          'xml:lang': 'en',
        }).txt(provenanceEn.text);
      }

      if (provenanceDe.citation !== '') {
        provenanceDescriptionSet.ele('lido:sourceDescriptiveNote')
          .txt(provenanceDe.citation);
      }
    }


    //   └─ End: lido:objectDescriptionWrap

    //   ├─ lido:objectMeasurementsWrap
    const objectMeasurementsWrap = objectIdentificationWrap.ele('lido:objectMeasurementsWrap');

    // Extract all dimension pairs from dimensions and dimensions_referenced
    const dimensionPairsDe = this.extractAllDimensionPairs(languageData.de.dimensions);
    const dimensionPairsEn = this.extractAllDimensionPairs(languageData.en.dimensions);
    const dimensionPairsRefDe = this.extractAllDimensionPairs(languageData.de.dimensions_referenced);
    const dimensionPairsRefEn = this.extractAllDimensionPairs(languageData.en.dimensions_referenced);

    // Combine all pairs: first from dimensions, then unique pairs from dimensions_referenced
    const existingLabels = new Set(dimensionPairsDe.map((p) => p.label));
    const uniqueRefPairsDe = dimensionPairsRefDe.filter((p) => !existingLabels.has(p.label));
    const uniqueRefLabels = new Set(uniqueRefPairsDe.map((p) => p.label));
    const uniqueRefPairsEn = dimensionPairsRefEn.filter((p) => uniqueRefLabels.has(p.label));

    const allPairsDe = [...dimensionPairsDe, ...uniqueRefPairsDe];
    const allPairsEn = [...dimensionPairsEn, ...uniqueRefPairsEn];

    //   │  ├─ lido:objectMeasurementsSet (per dimension pair)
    allPairsDe.forEach((pairDe, index) => {
      const pairEn = allPairsEn[index];
      const measurementsSet = objectMeasurementsWrap.ele('lido:objectMeasurementsSet');

      measurementsSet.ele('lido:displayObjectMeasurements', {
        'xml:lang': 'de',
      }).txt(pairDe.display);

      if (pairEn) {
        measurementsSet.ele('lido:displayObjectMeasurements', {
          'xml:lang': 'en',
        }).txt(pairEn.display);
      }

      const objectMeasurements = measurementsSet.ele('lido:objectMeasurements');
      objectMeasurements.ele('lido:measurementsSet')
        .ele('lido:measurementType', {
          'xml:lang': 'de',
        })
        .txt('Höhe x Breite')
        .up()
        .ele('lido:measurementType', {
          'xml:lang': 'en',
        })
        .txt('height x width')
        .up()
        .ele('lido:measurementUnit')
        .txt('mm')
        .up()
        .ele('lido:measurementValue')
        .txt(pairDe.value);

      objectMeasurements.ele('lido:extentMeasurements', {
        'xml:lang': 'de',
      }).txt(pairDe.label);

      if (pairEn) {
        objectMeasurements.ele('lido:extentMeasurements', {
          'xml:lang': 'en',
        }).txt(pairEn.label);
      }
    });
    //   │  └─ End: lido:objectMeasurementsSet (per dimension pair)
    //   └─ End: lido:objectMeasurementsWrap

    //   └─ lido:objectMaterialsTechWrap
    if (languageData.de.objectworktype_value || languageData.en.objectworktype_value) {
      const objectMaterialsTechWrap = objectIdentificationWrap.ele('lido:objectMaterialsTechWrap');
      const objectMaterialsTechSet = objectMaterialsTechWrap.ele('lido:objectMaterialsTechSet');

      // Resolve materialsTechData first so its terms can be used in displayMaterialsTech
      const materialsTechData = getMaterialsTechData(languageData.de.objectworktype_value);

      if (languageData.de.objectworktype_value) {
        objectMaterialsTechSet.ele('lido:displayMaterialsTech', {
          'xml:lang': 'de',
        }).txt(materialsTechData ? materialsTechData.termDe : languageData.de.objectworktype_value);
      }

      if (languageData.en.objectworktype_value) {
        objectMaterialsTechSet.ele('lido:displayMaterialsTech', {
          'xml:lang': 'en',
        }).txt(materialsTechData ? materialsTechData.termEn : languageData.en.objectworktype_value);
      }

      // Add lido:materialsTech based on objectworktype_value
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
    }

    if (involvedPersonsPublisher.length > 0) {
      personsByRoleTypeReferenced.PUBLISHER = involvedPersonsPublisher;
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
          const actorNameDe = personDe.name || personDe.suffix;
          if (!actorNameDe) return;

          const actorNameEn = personEn && (personEn.name || personEn.suffix);

          const hasAttribution = personIndex > 0;
          const eventActor = event.ele('lido:eventActor');
          eventActor.ele('lido:displayActorInRole', {
            'xml:lang': 'de',
          }).txt(hasAttribution ? `${actorNameDe}, zugeschrieben an` : actorNameDe);

          if (actorNameEn) {
            eventActor.ele('lido:displayActorInRole', {
              'xml:lang': 'en',
            }).txt(hasAttribution ? `${actorNameEn}, attributed to` : actorNameEn);
          }

          const actorInRole = eventActor.ele('lido:actorInRole');
          const actor = actorInRole.ele('lido:actor', {
            'lido:type': 'http://terminology.lido-schema.org/lido00163',
          });
          actor.ele('lido:actorID', {
            'lido:type': 'http://terminology.lido-schema.org/lido00099',
          }).txt(getPersonGND(actorNameDe));

          const nameActorSet = actor.ele('lido:nameActorSet');
          nameActorSet.ele('lido:appellationValue', {
            'xml:lang': 'de',
          }).txt(actorNameDe);

          if (actorNameEn) {
            nameActorSet.ele('lido:appellationValue', {
              'xml:lang': 'en',
            }).txt(actorNameEn);
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
          if (hasAttribution) {
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

      if (roleType === 'INVENTOR' || roleType === 'PRINTER' || roleType === 'ARTIST') {
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
        } else if (roleType === 'ARTIST') {
          eventDateData = {
            datedDe: languageData.de.date_referenced.dated,
            datedEn: languageData.en.date_referenced.dated,
            begin: languageData.en.date_referenced.begin,
            end: languageData.en.date_referenced.end,
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

    //   ├─ lido:relatedWorkSet (skip for drawings)
    if (languageData.de.classification !== 'Zeichnung') {
      const relatedWorkSet = relatedWorksWrap.ele('lido:relatedWorkSet');
      const relatedObject = relatedWorkSet.ele('lido:relatedWork').ele('lido:object');

      const gndReference = this.getCatalogReference(languageData.de.catalog_work_references, 'GND');
      if (gndReference) {
        relatedObject.ele('lido:objectID', {
          'lido:type': 'http://terminology.lido-schema.org/lido00099',
        }).txt(gndReference);
      }

      relatedObject.ele('lido:objectID', {
        'lido:type': 'http://terminology.lido-schema.org/lido00100',
        'lido:source': `${domain}`,
      }).txt(`${languageData.de.inventory_number_referenced}`);

      const bartschNumber = this.getCatalogReference(languageData.de.catalog_work_references, 'Bartsch');
      if (bartschNumber) {
        relatedObject.ele('lido:objectID', {
          'lido:type': 'http://terminology.lido-schema.org/lido00100',
          'lido:source': 'http://d-nb.info/gnd/4405115-3',
        }).txt(`Bartsch ${bartschNumber}`);
      }

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
    }

    languageData.de.publications.forEach((publication) => {
      relatedWorksWrap.ele('lido:relatedWorkSet')
        .ele('lido:relatedWork')
        .ele('lido:object')
        .ele('lido:objectNote')
        .txt((() => {
          const stripHtml = (str) => (str ? str.replace(/<[^>]+>/g, '') : str);
          const parts = [
            publication.authors,
            stripHtml(publication.title),
            publication.publish_location,
            publication.publish_date,
          ].filter(Boolean);
          const pageStr = publication.pageNumber ? `, S. ${publication.pageNumber}` : '';
          return parts.join(', ') + pageStr;
        })())
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
    const recordSourceRepoData = getRepositoryID('Cranach Digital Archive');
    recordSource.ele('lido:legalBodyID', {
      'lido:type': 'http://terminology.lido-schema.org/lido00099',
    }).txt(recordSourceRepoData.repositoryID);
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

    // Process only images from the 'overall' category
    const allImagesWithCategory = [];
    const imageCategories = languageData.de.images || {};
    const overallCategory = imageCategories.overall;
    if (overallCategory && overallCategory.images && Array.isArray(overallCategory.images)) {
      overallCategory.images.forEach((image) => {
        allImagesWithCategory.push({
          ...image,
          category: 'overall',
        });
      });
    }

    // Create a resourceSet for each image
    allImagesWithCategory.forEach((imageWithCategory) => {
      const image = imageWithCategory;
      //   ├─ lido:resourceSet (per image)
      const resourceSet = resourceWrap.ele('lido:resourceSet');

      //   │  ├─ lido:resourceID
      resourceSet.ele('lido:resourceID', {
        'lido:type': 'http://terminology.lido-schema.org/lido00100',
      }).txt(image.id);

      const addRepresentation = (sizeData, type) => {
        const rep = resourceSet.ele('lido:resourceRepresentation', {
          'lido:type': type,
        });
        rep.ele('lido:linkResource', {
          'lido:formatResource': 'image/jpeg',
        }).txt(sizeData.src);

        const measurements = rep.ele('lido:resourceMeasurementsSet');
        measurements.ele('lido:measurementType')
          .ele('skos:Concept', {
            'rdf:about': 'http://www.wikidata.org/wiki/Q35059',
          })
          .ele('skos:prefLabel', { 'xml:lang': 'en' }).txt('width')
          .up()
          .ele('skos:prefLabel', { 'xml:lang': 'de' }).txt('Breite')
          .up()
          .ele('skos:mappingRelation').txt('http://vocab.getty.edu/aat/300055647');
        measurements.ele('lido:measurementUnit')
          .ele('skos:Concept', {
            'rdf:about': 'http://www.wikidata.org/wiki/Q355198',
          })
          .ele('skos:prefLabel', { 'xml:lang': 'en' }).txt('pixel')
          .up()
          .ele('skos:prefLabel', { 'xml:lang': 'de' }).txt('Pixel')
          .up()
          .ele('skos:mappingRelation').txt('http://vocab.getty.edu/aat/300266190');
        measurements.ele('lido:measurementValue')
          .txt(sizeData.dimensions.width.toString());
      };

      //   │  ├─ lido:resourceRepresentation (thumbnail small — lido00451)
      if (image.sizes.small) {
        addRepresentation(image.sizes.small, 'http://terminology.lido-schema.org/lido00451');
      }

      //   │  ├─ lido:resourceRepresentation (thumbnail medium — lido00451 / high-resolution fallback — lido00464)
      if (image.sizes.large) {
        addRepresentation(image.sizes.medium, 'http://terminology.lido-schema.org/lido00451');
        addRepresentation(image.sizes.large, 'http://terminology.lido-schema.org/lido00464');
      } else if (image.sizes.medium) {
        addRepresentation(image.sizes.medium, 'http://terminology.lido-schema.org/lido00464');
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
      const imageMetadata = imageMetadataMap[image.id] || {};
      const categoryDescription = categoryDescriptions[image.category] || 'Weitere Ansicht';
      const resourceDescriptionAttrs = imageMetadata.isDownloadable === false
        ? { 'lido:type': 'download' }
        : {};
      resourceSet.ele('lido:resourceDescription', resourceDescriptionAttrs)
        .txt(imageMetadata.isDownloadable === false ? 'deaktiviert' : categoryDescription);

      //   │  ├─ lido:resourceSource
      const sourceName = (imageMetadata.source?.de || '').replace(/^©\s*/, '');
      const createdName = (imageMetadata.created?.de || '').replace(/^©\s*/, '') || 'Cranach Digital Archive';
      const sourceRepoData = getRepositoryID(sourceName);

      // resourceSource and rightsHolder must always refer to the same institution.
      // Use sourceName only when it resolves to a known repository; otherwise fall back to TH Köln.
      const rightsHolderRepoData = sourceRepoData.repositoryID !== 'unbekannt'
        ? sourceRepoData
        : getRepositoryID('Technische Hochschule Köln');
      const rightsHolderName = sourceRepoData.repositoryID !== 'unbekannt'
        ? sourceName
        : 'Technische Hochschule Köln';

      resourceSet.ele('lido:resourceSource')
        .ele('lido:legalBodyID', {
          'lido:type': 'http://terminology.lido-schema.org/lido00099',
        })
        .txt(rightsHolderRepoData.repositoryID)
        .up()
        .ele('lido:legalBodyName')
        .ele('lido:appellationValue')
        .txt(rightsHolderName);

      //   │  └─ lido:rightsResource
      const rightsResource = resourceSet.ele('lido:rightsResource');

      // Choose rights metadata based on whether the delivered image carries a watermark.
      if (imageMetadata.hasWatermark) {
        // Watermarked derivatives are exposed under a restrictive CC BY-NC-SA license.
        rightsResource.ele('lido:rightsType', {
          'lido:type': 'http://terminology.lido-schema.org/lido00921',
        })
          .ele('skos:Concept', {
            'rdf:about': 'http://creativecommons.org/licenses/by-nc-sa/4.0/',
          })
          .ele('skos:prefLabel', {
            'xml:lang': 'de',
          })
          .txt('Namensnennung - Nicht kommerziell - Weitergabe unter gleichen Bedingungen 4.0 international')
          .up()
          .ele('skos:prefLabel', {
            'xml:lang': 'en',
          })
          .txt('Attribution-NonCommercial-ShareAlike 4.0 International');
      } else {
        // Unwatermarked resources are exposed as Public Domain Mark (no copyright restrictions).
        rightsResource.ele('lido:rightsType', {
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
      }

      rightsResource.ele('lido:rightsHolder')
        .ele('lido:legalBodyID', {
          'lido:type': 'http://terminology.lido-schema.org/lido00099',
        })
        .txt(rightsHolderRepoData.repositoryID)
        .up()
        .ele('lido:legalBodyName')
        .ele('lido:appellationValue')
        .txt(rightsHolderName);

      const createdNameForCreditLine = (imageMetadata.created?.de || '').replace(/^©\s*/, '');
      const creditLine = rightsHolderName === 'Technische Hochschule Köln'
        ? 'Cranach Digital Archive'
        : [rightsHolderName, createdNameForCreditLine].filter(Boolean).join(', ') || 'Cranach Digital Archive';
      rightsResource.ele('lido:creditLine')
        .txt(creditLine);
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
   * Extract all label:measurement pairs from a dimensions string.
   * @param {string} text - The dimensions string
   *   (e.g., "Blatt: 210 × 165 mm\nPassepartout: 230 × 171 mm\n[citation](url)")
   * @returns {Array<{label: string, value: string, display: string}>}
   *   Array of objects with label, numeric value, and full display text
   * @example
   * // Input: "Sheet: 210 × 165 mm\nMount: 230 × 171 mm\n[citation](url)"
   * // Output: [
   * //   { label: 'Sheet', value: '210 × 165', display: 'Sheet: 210 × 165 mm' },
   * //   { label: 'Mount', value: '230 × 171', display: 'Mount: 230 × 171 mm' },
   * // ]
   */
  extractAllDimensionPairs(text) {
    if (!text) return [];
    const pairs = [];
    const regex = /^([^:\n\][]+):\s*([\d-]+\s*[x×]\s*[\d-]+)\s*mm/gmi;
    let match = regex.exec(text);
    while (match) {
      pairs.push({
        label: match[1].trim(),
        value: match[2],
        display: `${match[1].trim()}: ${match[2]} mm`,
      });
      match = regex.exec(text);
    }
    return pairs;
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
   * Extract LostArt URL from markdown provenance text.
   * Expected pattern: [label](https://www.lostart...)
   * @param {string} provenance - Provenance text
   * @returns {string} LostArt URL or empty string if not found/invalid
   */
  extractLostArtUrlFromProvenance(provenance) {
    if (!provenance || typeof provenance !== 'string') return '';

    const markdownLinkMatch = provenance.match(/\[[^\]]+\]\((https?:\/\/[^\s)]+)\)/i);
    if (!markdownLinkMatch) return '';

    const candidateUrl = markdownLinkMatch[1];

    try {
      const parsedUrl = new URL(candidateUrl);
      if (parsedUrl.hostname.toLowerCase().includes('lostart')) {
        return candidateUrl;
      }
    } catch (error) {
      return '';
    }

    return '';
  }

  /**
   * Extract text and citation from a string
   * @param {string} deMarkings - DE markings string with markdown links
   * @param {string} enMarkings - EN markings string with markdown links
   * @returns {Array<{url: string, textDe: string, textEn: string, citation: string}>}
   */
  parseMarkingsEntries(deMarkings, enMarkings) {
    if (!deMarkings) return [];

    const stripQuotes = (text) => {
      if (!text) return text;
      const t = text.trim();
      return t.startsWith("'") && t.endsWith("'") ? t.slice(1, -1) : t;
    };

    const deText = stripQuotes(deMarkings);
    const enText = stripQuotes(enMarkings) || '';
    const linkPattern = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;

    const extractEntries = (text) => {
      const linkMatches = [];
      let match;
      linkPattern.lastIndex = 0;
      // eslint-disable-next-line no-cond-assign
      while ((match = linkPattern.exec(text)) !== null) {
        linkMatches.push({
          label: match[1],
          url: match[2],
          fullMatch: match[0],
          endIndex: match.index + match[0].length,
        });
      }

      const entries = linkMatches.map((m, i) => {
        const segStart = i === 0 ? 0 : linkMatches[i - 1].endIndex;
        const segment = text
          .substring(segStart, m.endIndex)
          .replace(m.fullMatch, `[${m.label}]`)
          .replace(/^[\s;,]+/, '')
          .trim();
        return { url: m.url, label: m.label, text: segment };
      });

      return entries;
    };

    const deEntries = extractEntries(deText);
    const enEntries = extractEntries(enText);

    if (deEntries.length === 0) {
      if (!deText.trim()) return [];
      const deParsed = this.extractTextAndCitation(deText.trim());
      const enParsed = this.extractTextAndCitation(enText.trim());
      return [{
        url: '',
        textDe: deParsed.text,
        textEn: enParsed.text,
        citation: deParsed.citation || enParsed.citation,
      }];
    }

    const plainEnEntries = enEntries.filter((e) => !e.url);
    let plainEnIndex = 0;

    return deEntries.map((deEntry) => {
      let enEntry;
      if (deEntry.url) {
        enEntry = enEntries.find((e) => e.url === deEntry.url);
      } else {
        enEntry = plainEnEntries[plainEnIndex++];
      }
      const deParsed = this.extractTextAndCitation(deEntry.text);
      const enParsed = this.extractTextAndCitation(enEntry ? enEntry.text : deEntry.text);
      return {
        url: deEntry.url,
        textDe: deParsed.text,
        textEn: enParsed.text,
        citation: deParsed.citation || enParsed.citation,
      };
    });
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

    // Match [label](url) markdown link at end
    const markdownMatch = text.match(/^(.*?)\s*\n?\s*(\[[^\]]+\]\([^)]+\))\s*$/s);
    if (markdownMatch) {
      return {
        text: markdownMatch[1].trim(),
        citation: markdownMatch[2].trim(),
      };
    }

    // Match [label] at end (no URL)
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
   * Split a footnotes string into individual numbered annotations.
   * Recognises entries starting with [n] at the beginning of a line.
   * Returns an empty array when no numbered entries are found.
   *
   * @param {string} text - The footnotes block (already trimmed)
   * @returns {Array<{number: number, text: string}>}
   */
  parseAnnotations(text) {
    if (!text) return [];
    const parts = text.split(/(?=^\[\d+\])/m);
    const annotations = parts.map(part => {
      const match = part.match(/^\[(\d+)\]\s*([\s\S]*)/);
      if (!match) return null;
      return { number: parseInt(match[1], 10), rawText: part.trim(), text: match[2].trim() };
    }).filter(Boolean);
    return annotations;
  }

  /**
   * Split a long descriptive_note_value into description, footnotes and sources.
   *
   * Markers (matched in order):
   *   - Footnote block: separated by a line of 3+ underscores
   *   - Sources block: introduced by "Quellen / Publikationen:" (DE) or
   *     "Sources / Publications:" / "Bibliography:" / "References:" (EN)
   *
   * Each block is optional. If no marker is found, the entire text is
   * returned as `description`.
   *
   * @param {string} text - Already trimmed text (e.g. output of extractTextAndCitation)
   * @returns {{description: string, footnotes: string, sources: string}}
   */
  splitDescriptiveNote(text) {
    if (!text) return { description: '', footnotes: '', sources: '' };

    const sourcesMarker = /\n+\s*(?:Quellen(?:\s*\/\s*Publikationen)?|Literatur|Bibliografie|Bibliographie|Sources(?:\s*\/\s*Publications)?|Publications|Bibliography|References)\s*:\s*\n?/i;
    const footnoteSeparator = /\n\s*_{3,}\s*\n/;

    let description = text;
    let footnotes = '';
    let sources = '';

    const footnoteParts = description.split(footnoteSeparator);
    if (footnoteParts.length >= 2) {
      description = footnoteParts[0];
      const rest = footnoteParts.slice(1).join('\n________________\n');

      const sourcesIndex = rest.search(sourcesMarker);
      if (sourcesIndex !== -1) {
        footnotes = rest.slice(0, sourcesIndex);
        sources = rest.slice(sourcesIndex).replace(sourcesMarker, '');
      } else {
        footnotes = rest;
      }
    } else {
      const sourcesIndex = description.search(sourcesMarker);
      if (sourcesIndex !== -1) {
        const before = description.slice(0, sourcesIndex);
        sources = description.slice(sourcesIndex).replace(sourcesMarker, '');
        description = before;
      }
    }

    return {
      description: description.trim(),
      footnotes: footnotes.trim(),
      sources: sources.trim(),
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
