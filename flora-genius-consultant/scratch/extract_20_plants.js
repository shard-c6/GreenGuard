const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '../data');

// Resolve full absolute paths and normalize them to strip any traversal sequences (e.g. ../)
const inputPath = path.normalize(path.resolve(DATA_DIR, 'new_plants.json'));
const outputPath = path.normalize(path.resolve(DATA_DIR, 'new_plants_batch_20.json'));

// Strictly verify that the paths reside within the allowed DATA_DIR (using trailing slash boundary checks)
const expectedPrefix = DATA_DIR + path.sep;
if (!inputPath.startsWith(expectedPrefix)) {
  throw new Error("Security Error: Path traversal detected on input path!");
}
if (!outputPath.startsWith(expectedPrefix)) {
  throw new Error("Security Error: Path traversal detected on output path!");
}

const plants = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const selectedPlants = plants.slice(0, 20);

fs.writeFileSync(outputPath, JSON.stringify(selectedPlants, null, 4));
console.log(`Successfully wrote ${selectedPlants.length} plants to data/new_plants_batch_20.json`);

