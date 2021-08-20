const path = require('path');

const translations = require(path.join(__dirname, '..', 'assets', 'json', 'translations.json'));

function getTranslation(key, language) {
  if (!key && !language) {
    return false;
  }
  if (!translations[key] || !translations[key][language]) {
    return false;
  }
  return (translations[key][language]);
}

module.exports = {
  getTranslation,
};
