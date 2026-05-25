const axios = require('axios');
const FormData = require('form-data');

const sharp = require('sharp');

/**
 * Identifies a plant using the PlantNet API.
 * @param {Buffer} imageBuffer - The image file buffer.
 * @param {string} originalName - The original filename.
 */
async function identifyPlant(imageBuffer, originalName, mimetype) {
  const apiKey = process.env.PLANTNET_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ Warning: PLANTNET_API_KEY is not configured. Returning deterministic mock identification.');
    return {
      common_name: 'Holy Basil (Tulsi)',
      scientific_name: 'Ocimum tenuiflorum',
      confidence: 94.5,
    };
  }

  let finalBuffer = imageBuffer;
  let finalMimetype = mimetype;

  // PlantNet does not support webp natively, so we convert to jpeg
  if (mimetype === 'image/webp' || originalName.toLowerCase().endsWith('.webp')) {
    finalBuffer = await sharp(imageBuffer)
      .jpeg({ quality: 90 })
      .toBuffer();
    finalMimetype = 'image/jpeg';
  }

  const form = new FormData();
  form.append('images', finalBuffer, { 
    filename: originalName.replace(/\.webp$/i, '.jpg'),
    contentType: finalMimetype 
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
