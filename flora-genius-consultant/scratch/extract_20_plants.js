const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '../data/new_plants.json');
const outputPath = path.join(__dirname, '../data/new_plants_batch_20.json');

const plants = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const selectedPlants = plants.slice(0, 20);

fs.writeFileSync(outputPath, JSON.stringify(selectedPlants, null, 4));
console.log(`Successfully wrote ${selectedPlants.length} plants to data/new_plants_batch_20.json`);
