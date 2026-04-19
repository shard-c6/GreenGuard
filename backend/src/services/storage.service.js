const { supabaseAdmin } = require('../config/supabase');
const { v4: uuidv4 } = require('crypto');

/**
 * Uploads a file buffer to Supabase Storage.
 * Returns the public URL of the uploaded file.
 */
async function uploadToStorage(bucket, fileBuffer, originalName, mimetype) {
  const ext = originalName.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(fileName, fileBuffer, {
      contentType: mimetype,
      upsert: false,
    });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabaseAdmin.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

/**
 * Upload multiple files and return array of public URLs.
 */
async function uploadMultipleToStorage(bucket, files) {
  const urls = [];
  for (const file of files) {
    const url = await uploadToStorage(bucket, file.buffer, file.originalname, file.mimetype);
    urls.push(url);
  }
  return urls;
}

/**
 * Delete a file from Supabase Storage by its path.
 */
async function deleteFromStorage(bucket, filePath) {
  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .remove([filePath]);

  if (error) {
    console.error(`Storage delete failed: ${error.message}`);
  }
}

module.exports = { uploadToStorage, uploadMultipleToStorage, deleteFromStorage };
