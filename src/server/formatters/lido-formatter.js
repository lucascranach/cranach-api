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

    // LIDO Record ID
    lido.ele('lido:lidoRecID', {
      'lido:type': 'http://terminology.lido-schema.org/lido00100',
      'lido:source': 'https://d-nb.info/gnd/1073160734',
    }).txt(`gnd1073160734/lido/${inventoryNumber}`);

    // Object Published ID
    lido.ele('lido:objectPublishedID', {
      'lido:type': 'http://terminology.lido-schema.org/lido00099',
      'lido:source': domain,
    }).txt(`${sourceUrl}/object`);

    // Descriptive Metadata
    const descriptiveMetadata = lido.ele('lido:descriptiveMetadata', { 'xml:lang': primaryLanguage });

    // Object Classification Wrap
    const objectClassificationWrap = descriptiveMetadata.ele('lido:objectClassificationWrap');
    const objectWorkTypeWrap = objectClassificationWrap.ele('lido:objectWorkTypeWrap');
    const objectWorkType = objectWorkTypeWrap.ele('lido:objectWorkType');

    objectWorkType.ele('lido:conceptID', {
      'lido:type': 'http://terminology.lido-schema.org/lido00099',
    }).txt(this.getObjectWorkTypeURI(primaryData.objectworktype_id));

    // Output multilingual terms - always output both de and en in consistent order
    if (languageData.de && languageData.de.objectworktype_value) {
      objectWorkType.ele('lido:term', {
        'xml:lang': 'de',
      }).txt(languageData.de.objectworktype_value);
    }

    if (languageData.en && languageData.en.objectworktype_value) {
      objectWorkType.ele('lido:term', {
        'xml:lang': 'en',
      }).txt(languageData.en.objectworktype_value);
    }

    objectClassificationWrap.ele('lido:classificationWrap')
      .ele('lido:classification', {
        'lido:type': 'Objektklassifikation',
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
      .txt(primaryData.classification);

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

    const objectDescriptionWrap = objectIdentificationWrap.ele('lido:objectDescriptionWrap');
    const objectDescriptionSet = objectDescriptionWrap.ele('lido:objectDescriptionSet');

    if (languageData.de && languageData.de.descriptive_note_value) {
      objectDescriptionSet.ele('lido:descriptiveNoteValue', {
        'xml:lang': 'de',
      }).txt(this.removeCdaTag(languageData.de.descriptive_note_value));
    }

    if (languageData.en && languageData.en.descriptive_note_value) {
      objectDescriptionSet.ele('lido:descriptiveNoteValue', {
        'xml:lang': 'en',
      }).txt(this.removeCdaTag(languageData.en.descriptive_note_value));
    }

    // Separate objectDescriptionSet for provenance
    const provenanceDescriptionSet = objectDescriptionWrap.ele('lido:objectDescriptionSet', {
      'lido:type': 'http://terminology.lido-schema.org/lido01110',
    });

    if (languageData.de && languageData.de.provenance) {
      provenanceDescriptionSet.ele('lido:descriptiveNoteValue', {
        'xml:lang': 'de',
      }).txt(languageData.de.provenance.replace(/^- /, ''));
    }

    if (languageData.en && languageData.en.provenance) {
      provenanceDescriptionSet.ele('lido:descriptiveNoteValue', {
        'xml:lang': 'en',
      }).txt(languageData.en.provenance);
    }

    // Object Materials/Techniques
    const objectMaterialsTechWrap = objectIdentificationWrap.ele('lido:objectMaterialsTechWrap');
    const objectMaterialsTechSet = objectMaterialsTechWrap.ele('lido:objectMaterialsTechSet');

    // displayMaterialsTech - Freitext für Material und Technik
    if (languageData.de && languageData.de.display_materials_tech) {
      objectMaterialsTechSet.ele('lido:displayMaterialsTech', {
        'xml:lang': 'de',
      }).txt(this.removeCdaTag(languageData.de.display_materials_tech));
    }

    if (languageData.en && languageData.en.display_materials_tech) {
      objectMaterialsTechSet.ele('lido:displayMaterialsTech', {
        'xml:lang': 'en',
      }).txt(this.removeCdaTag(languageData.en.display_materials_tech));
    }

    const eventWrap = descriptiveMetadata.ele('lido:eventWrap');
    const eventSet = eventWrap.ele('lido:eventSet');

    const involvedPersonsDe = languageData.de.involved_persons;
    const involvedPersonsEn = languageData.en.involved_persons;

    // Group persons by roleType
    const personsByRoleType = {};
    involvedPersonsDe.forEach((person, index) => {
      const { roleType } = person;
      if (!personsByRoleType[roleType]) {
        personsByRoleType[roleType] = [];
      }
      personsByRoleType[roleType].push({
        personDe: person,
        personEn: involvedPersonsEn[index],
        index,
      });
    });

    // Determine which roleType should receive the eventDate
    let eventDateRoleType = 'ARTIST'; // Default fallback
    if (personsByRoleType.PRINTER) {
      eventDateRoleType = 'PRINTER';
    } else if (personsByRoleType.PRINTMAKER) {
      eventDateRoleType = 'PRINTMAKER';
    }

    // Create one lido:event per roleType
    Object.keys(personsByRoleType).forEach((roleType) => {
      const persons = personsByRoleType[roleType];
      const eventData = this.getEventDataByRoleType(roleType);

      const event = eventSet.ele('lido:event');
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

      // Add all persons with this roleType as eventActors
      persons.forEach(({ personDe, personEn }, personIndex) => {
        const eventActor = event.ele('lido:eventActor');
        eventActor.ele('lido:displayActorInRole', {
          'xml:lang': 'de',
        }).txt(personDe.name);

        // Add English name if available
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
          // TODO: Add GND URI for person if available
        }).txt('TODO: GND URI for person')
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

        // Add attributionQualifierActor for all persons except the first one in this event
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


      // Add lido:eventDate only to the event with the designated roleType
      if (roleType === eventDateRoleType) {
        const eventDateDe = languageData.de.event_date;
        const eventDateEn = languageData.en.event_date;

        if (eventDateDe) {
          // Collect all begin and end dates
          const beginDates = [eventDateDe.begin];
          const endDates = [eventDateDe.end];

          // Add dates from historicEventInformations if available
          const historicEvents = eventDateDe.historicEventInformations;
          if (Array.isArray(historicEvents)) {
            historicEvents.forEach((info) => {
              if (info.begin) beginDates.push(info.begin);
              if (info.end) endDates.push(info.end);
            });
          }

          // Find earliest and latest dates (filter out null/undefined values)
          const validBeginDates = beginDates.filter((d) => d != null && !Number.isNaN(d));
          const validEndDates = endDates.filter((d) => d != null && !Number.isNaN(d));
          const earliestDate = validBeginDates.length > 0 ? Math.min(...validBeginDates) : null;
          const latestDate = validEndDates.length > 0 ? Math.max(...validEndDates) : null;

          // Build displayDate string for German
          let displayDateDe = '';
          if (eventDateDe.dated) {
            displayDateDe = eventDateDe.dated;
            if (eventDateDe.remarks) {
              displayDateDe += ` ${eventDateDe.remarks}`;
            }
          }

          // Add historic event informations to displayDate
          if (Array.isArray(historicEvents)) {
            historicEvents.forEach((info) => {
              if (info.text) {
                if (displayDateDe) displayDateDe += ', ';
                displayDateDe += info.text;
                if (info.remarks) {
                  displayDateDe += ` ${info.remarks}`;
                }
              }
            });
          }

          // Build displayDate string for English
          let displayDateEn = '';
          if (eventDateEn.dated) {
            displayDateEn = eventDateEn.dated;
            if (eventDateEn.remarks) {
              displayDateEn += ` ${eventDateEn.remarks}`;
            }
          }

          // Add historic event informations to displayDate (English)
          if (Array.isArray(eventDateEn.historicEventInformations)) {
            eventDateEn.historicEventInformations.forEach((info) => {
              if (info.text) {
                if (displayDateEn) displayDateEn += ', ';
                displayDateEn += info.text;
                if (info.remarks) {
                  displayDateEn += ` ${info.remarks}`;
                }
              }
            });
          }

          const eventDate = event.ele('lido:eventDate');

          // Add display dates for both languages
          if (displayDateDe) {
            eventDate.ele('lido:displayDate', {
              'xml:lang': 'de',
            }).txt(displayDateDe);
          }

          if (displayDateEn) {
            eventDate.ele('lido:displayDate', {
              'xml:lang': 'en',
            }).txt(displayDateEn);
          }

          // Add structured date if we have valid dates
          if (earliestDate !== null || latestDate !== null) {
            const date = eventDate.ele('lido:date');

            if (earliestDate !== null) {
              date.ele('lido:earliestDate', {
                'lido:type': 'http://terminology.lido-schema.org/lido00529',
              }).txt(earliestDate.toString());
            }

            if (latestDate !== null) {
              date.ele('lido:latestDate', {
                'lido:type': 'http://terminology.lido-schema.org/lido00529',
              }).txt(latestDate.toString());
            }
          }
        }
      }
    });

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
    }).txt('https://d-nb.info/gnd/1073160734');
    recordSource.ele('lido:legalBodyName').ele('lido:appellationValue').txt('Cranach Digital Archive');
    recordSource
      .ele('lido:legalBodyWeblink')
      .txt(`${domain}`);

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

  getClassificationURI(classification) {
    switch (classification) {
      // Zeichnung oder Drawing
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
}

module.exports = LidoFormatter;
