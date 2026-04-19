const axios = require('axios');
const FormData = require('form-data');

/**
 * Identifies a plant using the PlantNet API.
 * @param {Buffer} imageBuffer - The image file buffer.
 * @param {string} originalName - The original filename.
 */
async function identifyPlant(imageBuffer, originalName, mimetype) {
  const apiKey = process.env.PLANTNET_API_KEY;
  if (!apiKey) {
    throw new Error('PLANTNET_API_KEY is not configured');
  }

  const form = new FormData();
  form.append('images', imageBuffer, { 
    filename: originalName,
    contentType: mimetype 
  });
  form.append('organs', 'leaf'); // Default to leaf for better accuracy

  try {
    const response = await axios.post(
      `https://my-api.plantnet.org/v2/identify/all?api-key=${apiKey}`,
      form,
      {
        headers: {
          ...form.getHeaders(),
        },
      }
    );

    const bestMatch = response.data.results?.[0];
    if (!bestMatch) {
      throw new Error('No plant identified in the image');
    }

    return {
      common_name: bestMatch.species?.commonNames?.[0] || 'Unknown Plant',
      scientific_name: bestMatch.species?.scientificNameWithoutAuthor || 'Unknown Species',
      confidence: bestMatch.score * 100,
    };
  } catch (error) {
    console.error('PlantNet Service Error:', error.response?.data || error.message);
    throw new Error('Failed to identify plant via PlantNet');
  }
}

module.exports = { identifyPlant };
