const fs = require('fs');
const path = require('path');

const outputFile = path.resolve(__dirname, '../../repository-sources.csv');
const CSV_HEADER = '"status";"inventoryNumber";"sourceName"\n';

const seenUnknown = new Set();
const seenKnown = new Set();

function csvField(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function writeRow(status, inventoryNumber, sourceName) {
  if (!fs.existsSync(outputFile)) {
    fs.writeFileSync(outputFile, CSV_HEADER);
  }
  const row = [status, inventoryNumber, sourceName].map(csvField).join(';');
  fs.appendFileSync(outputFile, `${row}\n`);
}

function logUnknownSource(sourceName, inventoryNumber) {
  const key = `${inventoryNumber}|${sourceName}`;
  if (!sourceName || seenUnknown.has(key)) return;
  seenUnknown.add(key);
  writeRow('unknown', inventoryNumber, sourceName);
  // eslint-disable-next-line no-console
  console.warn(`[repositorySources] Unknown source: "${sourceName}" (${inventoryNumber})`);
}

function logKnownSource(sourceName, inventoryNumber) {
  const key = `${inventoryNumber}|${sourceName}`;
  if (!sourceName || seenKnown.has(key)) return;
  seenKnown.add(key);
  writeRow('known', inventoryNumber, sourceName);
  // eslint-disable-next-line no-console
  console.info(`[repositorySources] Known source: "${sourceName}" (${inventoryNumber})`);
}

module.exports = { logUnknownSource, logKnownSource };
