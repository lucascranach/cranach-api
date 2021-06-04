const availableLanguages = [
  'de',
  'en',
];

const defaultLangauge = 'de';

function setLanguage(req, res, next) {
  if (req.query.language) {
    if (availableLanguages.includes(req.query.language)) {
      next();
    }
    else {
      res.status(500).json({ success: false, error: `Passed language is not supported. Available languages: ${availableLanguages.join(', ')}` });
      res.end();
    }
  } else {
    req.query.language = defaultLangauge;
    next();
  }
}

module.exports = setLanguage;
