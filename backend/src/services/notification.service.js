const { supabaseAdmin } = require('../config/supabase');

/**
 * Creates a notification for a user.
 * Uses the service_role client to bypass RLS.
 */
async function createNotification({ userId, type, title, body = null, data = null }) {
  const { error } = await supabaseAdmin
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      body,
      data,
    });

  if (error) {
    console.error('Failed to create notification:', error);
  }
}

/**
 * Notify adopter when their application is approved/rejected.
 */
async function notifyAdoptionResult({ adopterId, plantName, ngoName, status }) {
  const isApproved = status === 'approved';
  await createNotification({
    userId: adopterId,
    type: isApproved ? 'adoption_approved' : 'adoption_rejected',
    title: isApproved
      ? `🎉 Your adoption of "${plantName}" has been approved!`
      : `Your adoption request for "${plantName}" was not approved`,
    body: isApproved
      ? `${ngoName} has approved your adoption. You can now track your plant.`
      : `${ngoName} has reviewed your request. You can apply for other plants.`,
    data: { status },
  });
}

/**
 * Notify NGO when a new adoption application is received.
 */
async function notifyNewApplication({ ngoId, adopterName, plantName }) {
  await createNotification({
    userId: ngoId,
    type: 'new_application',
    title: `📋 New adoption application for "${plantName}"`,
    body: `${adopterName} wants to adopt your plant.`,
  });
}

module.exports = { createNotification, notifyAdoptionResult, notifyNewApplication };
