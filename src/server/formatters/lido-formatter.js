/* eslint-disable class-methods-use-this */
const { create } = require('xmlbuilder2');
const BaseFormatter = require('./base-formatter');
const translations = require('../translations');
const { getPersonGND, getRepositoryID } = require('../mappings/authority-files');

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
    const domain = 'https://lucascranach.org';
    const baseUrl = process.env.LIDO_BASE_URL || 'https://lucascranach.org/intern/artefacts-preview';
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
    // │  │  │  └─ lido:objectDescriptionSet (Provenance)
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

    // ── lido:lidoRecID ──
    lido.ele('lido:lidoRecID', {
      'lido:type': 'http://terminology.lido-schema.org/lido00100',
      'lido:source': 'https://d-nb.info/gnd/1073160734',
    }).txt(`gnd1073160734/lido/${inventoryNumber}`);

    // ── lido:objectPublishedID ──
    lido.com('TODO: Clarify how this ID should be constructed');
    lido.ele('lido:objectPublishedID', {
      'lido:type': 'http://terminology.lido-schema.org/lido00099',
      'lido:source': domain,
    }).txt(`${sourceUrl}/object`);
    lido.ele('lido:objectPublishedID', {
      'lido:type': 'http://terminology.lido-schema.org/lido00099',
      'lido:source': 'TODO: Add GND URI',
    }).txt('TODO: GND URI for the object');

    lido.ele('lido:objectPublishedID', {
      'lido:type': 'http://terminology.lido-schema.org/lido00100',
      'lido:source': 'https://d-nb.info/gnd/1073160734',
    }).txt(`gnd1073160734/object/${inventoryNumber}`);

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
    }).txt(this.getObjectWorkTypeURI(primaryData.objectworktype_id));

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
      }).txt(this.getClassificationURI(languageData.de.classification))
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
      }).txt(this.removeCdaTag(languageData.en.signature));

    //   │  └─ lido:inscriptions (Markings)

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
    //   └─ End: lido:inscriptionsWrap

    //   ├─ lido:repositoryWrap
    const repositoryWrap = objectIdentificationWrap.ele('lido:repositoryWrap');
    const repositorySet = repositoryWrap.ele('lido:repositorySet', {
      'lido:type': 'http://terminology.lido-schema.org/lido01017',
    });
    //   │  ├─ lido:displayRepository (Human-readable: "Institution (Location)")
    repositorySet.ele('lido:displayRepository', {
      'xml:lang': 'de',
    }).txt(`${languageData.de.repository} (${languageData.de.location.term})`);
    repositorySet.ele('lido:displayRepository', {
      'xml:lang': 'en',
    }).txt(`${languageData.en.repository} (${languageData.de.location.term})`);

    //   │  ├─ lido:repositoryName (Institution with GND identifier)
    repositorySet.ele('lido:repositoryName')
      .ele('lido:legalBodyID', {
        'lido:type': 'http://terminology.lido-schema.org/lido00099',
      }).txt(getRepositoryID(languageData.de.repository))
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

    //   │  ├─ lido:workID (Object identifier within repository)
    repositorySet.ele('lido:workID', {
      'lido:type': 'http://terminology.lido-schema.org/lido00113',
    }).txt(inventoryNumber.split('_').pop());

    //   │  └─ lido:repositoryLocation (Geographic location with GND place identifier)
    repositorySet.ele('lido:repositoryLocation')
      .ele('lido:placeID', {
        'lido:type': 'http://terminology.lido-schema.org/lido00099',
      }).txt(languageData.de.location.url)
      .up()
      .ele('lido:namePlaceSet')
      .ele('lido:appellationValue', {
        'lido:pref': 'http://terminology.lido-schema.org/lido00169',
        'xml:lang': 'de',
      }).txt(languageData.de.location.term)
      .up()
      .ele('lido:appellationValue', {
        'lido:pref': 'http://terminology.lido-schema.org/lido00169',
        'xml:lang': 'en',
      }).txt(languageData.en.location.term);
    //   └─ End: lido:repositoryWrap

    //   ├─ lido:objectDescriptionWrap
    const objectDescriptionWrap = objectIdentificationWrap.ele('lido:objectDescriptionWrap');
    //   │  ├─ objectDescriptionSet (general description)
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

    //   │  └─ objectDescriptionSet (Provenance)
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
    //   └─ End: lido:objectDescriptionWrap

    //   ├─ lido:objectMeasurementsWrap
    const objectMeasurementsWrap = objectIdentificationWrap.ele('lido:objectMeasurementsWrap');
    //   │  ├─ objectMeasurementsSet #1 (sheet measurements)
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
    //   └─ End: lido:objectMeasurements #1

    //   │  └─ objectMeasurementsSet #2 (image measurements)
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

    //   └─ End: lido:objectMeasurements #2
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
    const materialsTechData = this.getMaterialsTechData(languageData.de.objectworktype_value);
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

    // Find first involved person with roleType "PRINTER" from involvedPersonsDe
    const involvedPersonPrinterDe = involvedPersonsDe.find(
      (person) => person.roleType === 'PRINTER',
    );

    const involvedPersonPrinterEn = involvedPersonsEn.find(
      (person) => person.roleType === 'PRINTER',
    );

    // Group persons by role type (ARTIST, PRINTER, PRINTMAKER, etc.)
    const personsByRoleTypeReferenced = {};
    involvedPersonsReferencedDe.forEach((person, index) => {
      const { roleType } = person;
      if (!personsByRoleTypeReferenced[roleType]) {
        personsByRoleTypeReferenced[roleType] = [];
      }
      personsByRoleTypeReferenced[roleType].push({
        personDe: person,
        personEn: involvedPersonsReferencedEn[index],
      });
    });

    if (involvedPersonPrinterDe && involvedPersonPrinterEn) {
      personsByRoleTypeReferenced.PRINTER = [{
        personDe: involvedPersonPrinterDe,
        personEn: involvedPersonPrinterEn,
      }];
    } else {
      // Ensure PRINTER event exists even without persons
      personsByRoleTypeReferenced.PRINTER = [];
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
      const eventData = this.getEventDataByRoleType(roleType);

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
          actorInRole.ele('lido:actor', {
            'lido:type': 'http://terminology.lido-schema.org/lido00163',
          }).ele('lido:actorID', {
            'lido:type': 'http://terminology.lido-schema.org/lido00099',
          }).txt(getPersonGND(personDe.name))
            .up()
            .ele('lido:nameActorSet')
            .ele('lido:appellationValue', {
              'xml:lang': 'de',
            })
            .txt(personDe.name)
            .up()
            .ele('lido:appellationValue', {
              'xml:lang': 'en',
            })
            .txt(personEn.name);

          actorInRole.ele('lido:roleActor')
            .ele('lido:conceptID', {
              'lido:type': 'http://terminology.lido-schema.org/lido00099',
            }).txt(eventData.roleActor.conceptID)
            .up()
            .ele('lido:term', {
              'xml:lang': 'de',
            })
            .txt(personDe.role)
            .up()
            .ele('lido:term', {
              'xml:lang': 'en',
            })
            .txt(personEn.role);

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

    //   │  └─ lido:relatedWorkRelType
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

    // └─ lido:objectRelationWrap─────────────────────────────────────────┘

    // ╔═══════════════════════════════════════════════════════════════════════════╗
    // ║  lido:administrativeMetadata                                              ║
    // ╚═══════════════════════════════════════════════════════════════════════════╝
    const administrativeMetadata = lido.ele('lido:administrativeMetadata', { 'xml:lang': primaryLanguage });

    // ┌─ lido:recordWrap ──────────────────────────────────────────────────────┐
    const recordWrap = administrativeMetadata.ele('lido:recordWrap');
    //   ├─ lido:recordID
    recordWrap
      .ele('lido:recordID', {
        'lido:type': 'http://terminology.lido-schema.org/lido00100',
      }).txt(`${inventoryNumber}/record`);

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

    //   └─ lido:recordSource
    let recordSource = recordWrap.ele('lido:recordSource');
    recordSource.ele('lido:legalBodyID', {
      'lido:type': 'http://terminology.lido-schema.org/lido00099',
    }).txt('https://d-nb.info/gnd/1073160734');
    recordSource.ele('lido:legalBodyName').ele('lido:appellationValue').txt('Cranach Digital Archive');
    recordSource
      .ele('lido:legalBodyWeblink')
      .txt(`${domain}`);
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

    recordWrap.ele('lido:recordInfoSet', {
      'lido:type': 'http://terminology.lido-schema.org/lido00470',
    }).ele('lido:recordMetadataDate', {
      'lido:type': 'http://terminology.lido-schema.org/lido00473',
      'lido:source': domain,
    }).txt('TODO: Add date of last modification of the record. I don\'t know yet where to get the date from.');

    const resourceWrap = administrativeMetadata.ele('lido:resourceWrap');
    const resourceSet = resourceWrap.ele('lido:resourceSet');

    resourceSet.com('TODO: I don\'t know where to get the data in this element. Or are they the same in all records?');
    resourceSet.ele('lido:resourceID', {
      'lido:type': 'http://terminology.lido-schema.org/lido00100',
      'lido:source': 'http://ld.zdb-services.de/resource/organisations/DE-2102',
    }).txt('RBA 214 932');

    resourceSet.ele('lido:resourceRepresentation', {
      'lido:type': 'http://terminology.lido-schema.org/lido00451',
    }).ele('lido:linkResource')
      .txt(languageData.de.image_thumbnail);

    resourceSet.ele('lido:resourceRepresentation', {
      'lido:type': 'http://terminology.lido-schema.org/lido00464',
    }).ele('lido:linkResource')
      .txt(languageData.de.image_highres);

    resourceSet.ele('lido:resourceSource', {
      'lido:type': 'http://terminology.lido-schema.org/lido00413',
    })
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
      .ele('lido:legalBodyWeblink')
      .txt('https://lucascranach.org');

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
      .ele('lido:creditLine')
      .txt('Cranach Digital Archive');

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
   * @param {string} text - The input string (e.g., "Blatt: 277 x 190 mm, Darstellung: 282-284 x 194-202 mm")
   * @returns {string} The extracted dimensions (e.g., "277 x 190" or "282-284 x 194-202") without unit
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
   * Get GND URI for object work type
   * @param {string} id - Object type ID
   * @returns {string} GND URI or empty string
   */
  getObjectWorkTypeURI(id) {
    switch (id) {
      // Engraving
      case '010506':
        return 'http://vocab.getty.edu/aat/300041341';

      // Drawing
      case '010501':
        return 'http://vocab.getty.edu/aat/300033973';

      // Woodcut
      case '010505':
        return 'http://vocab.getty.edu/aat/300041410';

      default:
        return '';
    }
  }

  getClassificationURI(classification) {
    switch (classification) {
      // Drawing
      case 'Zeichnung':
        return 'http://vocab.getty.edu/aat/300033973';
      case 'Druckgrafik':
        return 'http://vocab.getty.edu/aat/300041273';
      default:
        return '';
    }
  }

  getEventDataByRoleType(roleType) {
    switch (roleType) {
      case 'ARTIST':
        return {
          eventType: {
            conceptID: 'http://terminology.lido-schema.org/lido00007',
            termDe: 'Herstellung',
            termEn: 'Production',
          },
          roleActor: {
            conceptID: 'http://vocab.getty.edu/aat/300025103',
          },
        };
      case 'PRINTER':
        return {
          eventType: {
            conceptID: 'http://terminology.lido-schema.org/lido01096',
            termDe: 'Herstellung des Exemplars',
            termEn: 'Production of the exemplar',
          },
          roleActor: {
            conceptID: 'http://vocab.getty.edu/aat/300025732',
          },
        };
      case 'INVENTOR':
        return {
          eventType: {
            conceptID: 'http://terminology.lido-schema.org/lido00224',
            termDe: 'Entwurf',
            termEn: 'Design',
          },
          roleActor: {
            conceptID: 'http://vocab.getty.edu/aat/300025845',
          },
        };
      case 'PUBLISHER':
        return {
          eventType: {
            conceptID: 'http://terminology.lido-schema.org/lido00228',
            termDe: 'Publikation',
            termEn: 'Publication',
          },
          roleActor: {
            conceptID: 'http://vocab.getty.edu/aat/300025574',
          },
        };
      case 'PRINTMAKER':
        return {
          eventType: {
            conceptID: 'http://terminology.lido-schema.org/lido01089',
            termDe: 'Herstellung der Druckform',
            termEn: 'Production of the printing plate',
          },
          roleActor: {
            conceptID: 'http://vocab.getty.edu/aat/300025165',
          },
        };
      default:
        return {
          eventType: {
            conceptID: '',
            termDe: 'nicht spezifiziert',
            termEn: 'not specified',
          },
          roleActor: {
            conceptID: '',
          },
        };
    }
  }

  /**
   * Get materials and technique data by type
   * @param {string} materialsTechType - Materials/technique type (e.g., 'Holzschnitt', 'Kupferstich', 'Zeichnung')
   * @returns {Object} Object with conceptID, termDe, and termEn
   */
  getMaterialsTechData(materialsTechType) {
    switch (materialsTechType) {
      case 'Holzschnitt':
        return {
          conceptID: 'http://vocab.getty.edu/aat/300053296',
          termDe: 'Holzschnitt (Druckverfahren)',
          termEn: 'woodcut (process)',
        };
      case 'Kupferstich':
        return {
          conceptID: 'http://vocab.getty.edu/aat/300053225',
          termDe: 'Kupferstich (Druckverfahren)',
          termEn: 'engraving (printing process)',
        };
      case 'Zeichnung':
        return {
          conceptID: 'http://vocab.getty.edu/aat/300054196',
          termDe: 'Zeichnung',
          termEn: 'drawing (image-making)',
        };
      default:
        return null;
    }
  }
}

module.exports = LidoFormatter;
