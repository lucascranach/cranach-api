/**
 * Authority file mappings for controlled vocabularies
 * Maps person names and institution names to their respective authority file URIs
 * (GND - Gemeinsame Normdatei, lobid.org)
 */

/**
 * Get person GND URI by person name
 * @param {string} personName - Name of the person (e.g., 'Lucas Cranach der Ältere')
 * @returns {string} GND URI (e.g., 'https://d-nb.info/gnd/118522582') or empty string if not found
 */
function getPersonGND(personName) {
  const personMapping = {
    'Albrecht Altdorfer': 'https://d-nb.info/gnd/118502220',
    'Albrecht Dürer': 'https://d-nb.info/gnd/11852786X',
    'Augustin Braun': 'https://d-nb.info/gnd/132604698',
    'Augustin Hirschvogel': 'https://d-nb.info/gnd/118774530',
    'Balthasar Mentzen von Nimeck': 'https://d-nb.info/gnd/124661084',
    'Boas Ulrich d. Ä.': 'https://d-nb.info/gnd/1161443118',
    'Christian Döring': 'https://d-nb.info/gnd/1037552709',
    'Christian Rödinger': 'https://d-nb.info/gnd/119799162',
    'Daniel Hopfer': 'https://d-nb.info/gnd/102508585',
    'Erhard Altdorfer': 'https://d-nb.info/gnd/118502239',
    'Erhard Schön': 'https://d-nb.info/gnd/120773163',
    'Gabriel Schnellboltz': 'https://d-nb.info/gnd/11982230X',
    'Georg Pencz': 'https://d-nb.info/gnd/118592602',
    'Georg Rhau': 'https://d-nb.info/gnd/115690387',
    'Georg Rhau (Erben)': 'https://d-nb.info/gnd/6146414-4',
    'Georg Rhau Heirs': 'https://d-nb.info/gnd/6146414-4',
    'Hans Albrecht von Derschau': 'https://d-nb.info/gnd/10063656X',
    'Hans Asper': 'https://d-nb.info/gnd/135772923',
    'Hans Baldung Grien': 'https://d-nb.info/gnd/118506188',
    'Hans Bocksberger der Ältere': 'https://d-nb.info/gnd/123211492',
    'Hans Brosamer': 'https://d-nb.info/gnd/118167375',
    'Hans Burgkmair der Ältere': 'https://d-nb.info/gnd/118665200',
    'Hans Burgkmair <der Ältere>': 'https://d-nb.info/gnd/118665200',
    'Hans Cranach': 'https://d-nb.info/gnd/11867045X',
    'Hans Guldenmund': 'https://d-nb.info/gnd/123253705',
    'Hans Herman': '',
    'Hans Holbein <der Jüngere>': 'https://d-nb.info/gnd/118552953',
    'Hans Kreuter': 'https://d-nb.info/gnd/1203604785',
    'Hans Lufft': 'https://d-nb.info/gnd/117313785',
    'Hans Sebald Beham': 'https://d-nb.info/gnd/118508326',
    'Hans Weiditz': 'https://d-nb.info/gnd/118806491',
    'Hans Wertinger': 'https://d-nb.info/gnd/118631659',
    'Hans Wolfgang Glaser': 'https://d-nb.info/gnd/131556436',
    'Heinrich Vogtherr (der Ältere)': 'https://d-nb.info/gnd/118966219',
    'Heinrich Vogtherr (der Jüngere)': 'https://d-nb.info/gnd/115587411',
    'Hieronymus Hopfer': 'https://d-nb.info/gnd/102508569',
    'Jacob Lucius der Jüngere': 'https://d-nb.info/gnd/123129877',
    'Jacob Lucius der Ältere': 'https://d-nb.info/gnd/123129885',
    'Johann Klocker': 'https://d-nb.info/gnd/143327100',
    'Johann Krafft': 'https://d-nb.info/gnd/128600691',
    'Johann Rhau-Grunenberg': 'https://d-nb.info/gnd/1013553780',
    'Johann Schwertel': 'https://d-nb.info/gnd/119827972',
    'Johann vom Berg': 'https://d-nb.info/gnd/123255791',
    'Johannes Winterburger': 'https://d-nb.info/gnd/118769448',
    'Kunstanstalt Nöhring und Frisch, Lübeck und Berlin': 'https://d-nb.info/gnd/137509030',
    'Lorenz Schwenck': 'https://d-nb.info/gnd/1037541618',
    'Lucas Cranach der Jüngere': 'https://d-nb.info/gnd/118522590',
    'Lucas Cranach der Ältere': 'https://d-nb.info/gnd/118522582',
    'Lucas van Leyden': 'https://d-nb.info/gnd/118729314',
    'Meister HB': 'https://d-nb.info/gnd/1012287394',
    'Meister HB (mit dem Greifenkopf)': 'https://d-nb.info/gnd/130271047',
    'Meister MB': '',
    'Meister der Legendenszenen': '',
    'Meister der Wunder von Mariazell': '',
    'Meister des Stötteritzer Altars': 'https://d-nb.info/gnd/1050956982',
    'Melchior Lotter der Jüngere': 'https://d-nb.info/gnd/119747170',
    'Melchior Lotter der Ältere': 'https://d-nb.info/gnd/119747162',
    'Michael Lotter': 'https://d-nb.info/gnd/119747189',
    'Michael Wolgemut': 'https://d-nb.info/gnd/118771175',
    'Monogrammist H.F.': '',
    'Monogrammist IB': 'https://d-nb.info/gnd/1245939173',
    'Monogrammist MS': 'https://d-nb.info/gnd/1089442904',
    'Nickel Schirlentz': 'https://d-nb.info/gnd/102249784',
    'Nikolaus Wolrab': 'https://d-nb.info/gnd/119874571',
    'Paul Helwig': 'https://d-nb.info/gnd/102563268',
    'Rudolf Zacharias Becker': 'https://d-nb.info/gnd/118508121',
    'Sebastian Reusch': 'https://d-nb.info/gnd/1037577736',
    'Sixtus Armin Thon': 'https://d-nb.info/gnd/117352195',
    'Symphorian Reinhart': 'https://d-nb.info/gnd/1037506510',
    'Ulrich Neuber': 'https://d-nb.info/gnd/123256038',
    'Virgilius Solis': 'https://d-nb.info/gnd/118615300',
    'W. Müller': '',
    'Wenzel von Olmütz': 'https://d-nb.info/gnd/104199148',
    'Werkstatt Lucas Cranach der Jüngere': 'https://d-nb.info/gnd/118522590',
    'Werkstatt Lucas Cranach der Ältere': 'https://d-nb.info/gnd/118522582',
    'Wilhelm Pleydenwurff': 'https://d-nb.info/gnd/11874111X',
    'Wolfgang Huber': 'https://d-nb.info/gnd/118554115',
    'Wolfgang Resch': 'https://d-nb.info/gnd/129183172',
    'Wolfgang Stöckel': 'https://d-nb.info/gnd/119837692',
    'Wolfgang Stürmer': 'https://d-nb.info/gnd/119842114',
    'Workshop Lucas Cranach the Elder': 'https://d-nb.info/gnd/118522582',
    'Zacharias Lehmann': 'https://d-nb.info/gnd/1037530721',
  };

  return personMapping[personName] || '';
}

/**
 * Get repository ID by institution name
 * @param {string} institutionName - Name of the institution (e.g., 'Albertina, Wien')
 * @returns {Object} Object with repositoryID and either isil or gnd properties,
 *   or default object if not found
 */
function getRepositoryID(institutionName) {
  const repositoryMapping = {
    'Albertina, Wien': {
      repositoryID: 'https://d-nb.info/gnd/2012512-4',
      gnd: '2012512-4',
    },
    'British Museum': {
      repositoryID: 'https://d-nb.info/gnd/38379-X',
      gnd: '38379-X',
    },
    'Eidgenössische Technische Hochschule Zürich': {
      repositoryID: 'https://culture.ld.admin.ch/isil/CH-000511-9',
      isil: 'CH-000511-9',
    },
    'Frick Art Reference Library, New York': {
      repositoryID: 'https://d-nb.info/gnd/5124895-5',
      gnd: '5124895-5',
    },
    'Germanisches Nationalmuseum, Nürnberg': {
      repositoryID: 'ld.zdb-services.de/resource/organisations/DE-MUS-105615',
      isil: 'DE-MUS-105615',
    },
    'Hamburger Kunsthalle': {
      repositoryID: 'ld.zdb-services.de/resource/organisations/DE-MUS-059210',
      isil: 'DE-MUS-059210',
    },
    'Herzog Anton Ulrich-Museum, Braunschweig': {
      repositoryID: 'ld.zdb-services.de/resource/organisations/DE-MUS-026819',
      isil: 'DE-MUS-026819',
    },
    'Herzog August Bibliothek Wolfenbüttel': {
      repositoryID: 'ld.zdb-services.de/resource/organisations/DE-MUS-162514',
      isil: 'DE-MUS-162514',
    },
    'Kunsthalle Bremen - Der Kunstverein in Bremen': {
      repositoryID: 'ld.zdb-services.de/resource/organisations/DE-MUS-027614',
      isil: 'DE-MUS-027614',
    },
    'Kunsthaus Zürich': {
      repositoryID: 'https://culture.ld.admin.ch/isil/CH-001899-9',
      isil: 'CH-001899-9',
    },
    'Kupferstich-Kabinett, Staatliche Kunstsammlungen Dresden': {
      repositoryID: 'ld.zdb-services.de/resource/organisations/DE-MUS-845516',
      isil: 'DE-MUS-845516',
    },
    'Kurpfälzisches Museum Heidelberg': {
      repositoryID: 'ld.zdb-services.de/resource/organisations/DE-MUS-204113',
      isil: 'DE-MUS-204113',
    },
    'Museum of Fine Arts, Houston': {
      repositoryID: 'https://d-nb.info/gnd/50293-5',
      gnd: '50293-5',
    },
    'The Museum of Fine Arts, Houston': {
      repositoryID: 'https://d-nb.info/gnd/50293-5',
      gnd: '50293-5',
    },
    'Palais des Beaux-Arts, Lille': {
      repositoryID: 'https://d-nb.info/gnd/108328665X',
      gnd: '108328665X',
    },
    'Staatliche Graphische Sammlung München': {
      repositoryID: 'ld.zdb-services.de/resource/organisations/DE-2948',
      isil: 'DE-2948',
    },
    'Staatsbibliothek Bamberg': {
      repositoryID: 'ld.zdb-services.de/resource/organisations/DE-22',
      isil: 'DE-22',
    },
    'Staatliche Museen zu Berlin - Preußischer Kulturbesitz, Kupferstichkabinett': {
      repositoryID: 'ld.zdb-services.de/resource/organisations/DE-MUS-018511',
      isil: 'DE-MUS-018511',
    },
    'Städel Museum Frankfurt a.M.': {
      repositoryID: 'ld.zdb-services.de/resource/organisations/DE-MUS-048017',
      isil: 'DE-MUS-048017',
    },
    'Universitätsbibliothek Erlangen-Nürnberg': {
      repositoryID: 'ld.zdb-services.de/resource/organisations/DE-29',
      isil: 'DE-29',
    },
    'Universitätsbibliothek Heidelberg': {
      repositoryID: 'ld.zdb-services.de/resource/organisations/DE-16',
      isil: 'DE-16',
    },
    'Universitätsbibliothek Leipzig': {
      repositoryID: 'ld.zdb-services.de/resource/organisations/DE-15',
      isil: 'DE-15',
    },
    'Kunstsammlungen der Veste Coburg': {
      repositoryID: 'ld.zdb-services.de/resource/organisations/DE-MUS-032517',
      isil: 'DE-MUS-032517',
    },
    'Veste Coburg Kunstsammlungen': {
      repositoryID: 'ld.zdb-services.de/resource/organisations/DE-MUS-032517',
      isil: 'DE-MUS-032517',
    },
    'Cranach Digital Archive': {
      repositoryID: 'https://d-nb.info/gnd/1073160734',
      gnd: '1073160734',
    },
    'Cranach Digital Archive (cda_)': {
      repositoryID: 'https://d-nb.info/gnd/1073160734',
      gnd: '1073160734',
    },
    'Technische Hochschule Köln': {
      repositoryID: 'ld.zdb-services.de/resource/organisations/DE-832',
      isil: 'DE-832',
    },
  };

  return repositoryMapping[institutionName] || { repositoryID: 'unbekannt', isil: 'unbekannt' };
}

/**
 * Get Getty AAT URI for object work type
 * @param {string} id - Object type ID
 * @returns {string} Getty AAT URI or empty string
 */
function getObjectWorkTypeURI(id) {
  switch (id) {
    // Engraving
    case '010506':
      return 'http://vocab.getty.edu/aat/300041341';

    // Drawing
    case '010501':
      return 'http://vocab.getty.edu/aat/300033973';

    // Woodcut
    case '010505':
      return 'http://vocab.getty.edu/aat/300041405';

    default:
      return '';
  }
}


/**
 * Get Getty AAT URI for classification
 * @param {string} classification - Classification name (e.g., 'Zeichnung', 'Druckgrafik')
 * @returns {string} Getty AAT URI or empty string
 */
function getClassificationURI(classification) {
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

/**
 * Get event data by role type (LIDO event types and Getty AAT role URIs)
 * @param {string} roleType - Role type (e.g., 'ARTIST', 'PRINTER', 'INVENTOR')
 * @returns {Object} Object with eventType and roleActor data
 */
function getEventDataByRoleType(roleType) {
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
 * Get materials and technique data by type (Getty AAT URIs)
 * @param {string} materialsTechType - Materials/technique type
 *   (e.g., 'Holzschnitt', 'Kupferstich', 'Zeichnung')
 * @returns {Object|null} Object with conceptID, termDe, and termEn, or null if not found
 */
function getMaterialsTechData(materialsTechType) {
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

module.exports = {
  getPersonGND,
  getRepositoryID,
  getObjectWorkTypeURI,
  getClassificationURI,
  getEventDataByRoleType,
  getMaterialsTechData,
};
