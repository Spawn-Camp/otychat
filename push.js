/**
 * OtyChat Push Notification Module
 * Handles sending push notifications to subscribed users
 */

const webpush = require('web-push');
const db = require('./db');

// Load VAPID keys from environment
require('dotenv').config();

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:contact@example.com';

// Configure web-push with VAPID details
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  console.log('[Push] Web push configured with VAPID keys');
} else {
  console.warn('[Push] VAPID keys not found in environment, push notifications disabled');
}

/**
 * Send a push notification to a user
 * @param {number} userId - The user's database ID
 * @param {object} payload - Notification payload { title, body, icon?, url?, tag? }
 * @returns {Promise<{ success: number, failed: number }>} - Count of successful/failed sends
 */
async function sendNotification(userId, payload) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn('[Push] Skipping notification - VAPID keys not configured');
    return { success: 0, failed: 0 };
  }

  const subscriptions = db.getUserPushSubscriptions(userId);

  if (!subscriptions || subscriptions.length === 0) {
    return { success: 0, failed: 0 };
  }

  let success = 0;
  let failed = 0;

  // Prepare the payload as JSON string
  const payloadString = JSON.stringify({
    title: payload.title || 'OtyChat',
    body: payload.body || '',
    icon: payload.icon || '/icons/icon-192.png',
    badge: payload.badge || '/icons/badge-72.png',
    url: payload.url || '/',
    tag: payload.tag || 'otychat-notification',
    ...payload
  });

  // Send to each subscription
  for (const sub of subscriptions) {
    try {
      // Reconstruct the subscription object expected by web-push
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.keys_p256dh,
          auth: sub.keys_auth
        }
      };

      await webpush.sendNotification(pushSubscription, payloadString);
      success++;
      console.log(`[Push] Sent notification to user ${userId}`);
    } catch (error) {
      failed++;

      // If subscription is invalid (expired, unsubscribed), remove it
      if (error.statusCode === 404 || error.statusCode === 410) {
        console.log(`[Push] Removing invalid subscription for user ${userId}`);
        db.removePushSubscription(sub.endpoint);
      } else {
        console.error(`[Push] Failed to send notification:`, error.message);
      }
    }
  }

  return { success, failed };
}

/**
 * Send notification to multiple users
 * @param {number[]} userIds - Array of user IDs
 * @param {object} payload - Notification payload
 * @returns {Promise<{ success: number, failed: number }>}
 */
async function sendNotificationToMany(userIds, payload) {
  let totalSuccess = 0;
  let totalFailed = 0;

  for (const userId of userIds) {
    const result = await sendNotification(userId, payload);
    totalSuccess += result.success;
    totalFailed += result.failed;
  }

  return { success: totalSuccess, failed: totalFailed };
}

/**
 * Get the public VAPID key for client subscription
 * @returns {string|null} The public VAPID key
 */
function getPublicVapidKey() {
  return VAPID_PUBLIC_KEY || null;
}

module.exports = {
  sendNotification,
  sendNotificationToMany,
  getPublicVapidKey
};
