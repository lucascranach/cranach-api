const path = require('path');

// TODO: Über fs module lösen
const translations = require(path.join(__dirname, '..', 'assets', 'translations', 'translations.json'));

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
