const UserActivity = require('../models/UserActivity');
const Reel = require('../models/Reel');

/**
 * Activity Service for tracking user interactions.
 * Tracking is non-blocking (fire-and-forget) to avoid slowing down main requests.
 */

// Simple in-memory cache for view deduplication (5 seconds window)
// Key: userId:reelId, Value: timestamp
const viewCache = new Map();
const DEDUPLICATION_WINDOW = 5000; // 5 seconds

/**
 * Track a single user activity
 * @param {Object} data - { userId, action, reelId, orderId, metadata }
 */
const trackActivity = ({ userId, action, reelId, orderId, metadata = {} }) => {
    // Fire and forget
    (async () => {
        try {
            if (action === 'view' && reelId && userId) {
                const cacheKey = `${userId}:${reelId}`;
                const lastView = viewCache.get(cacheKey);
                const now = Date.now();

                if (lastView && (now - lastView < DEDUPLICATION_WINDOW)) {
                    // Skip duplicate view within 5 seconds
                    return;
                }
                viewCache.set(cacheKey, now);

                // Periodic cleanup of cache
                setTimeout(() => {
                    if (viewCache.get(cacheKey) === now) {
                        viewCache.delete(cacheKey);
                    }
                }, DEDUPLICATION_WINDOW);
            }

            await UserActivity.create({
                userId,
                action,
                reelId,
                orderId,
                metadata,
                createdAt: new Date()
            });

            // If it's an order, increment the ordersCount on the Reel
            if (action === 'order' && reelId) {
                await Reel.findByIdAndUpdate(reelId, { $inc: { ordersCount: 1 } });
            }
        } catch (error) {
            console.error('Failed to track activity:', error);
        }
    })();
};

/**
 * Bulk track reel views (useful for list fetches)
 * @param {Array} reelIds 
 * @param {String} userId 
 */
const bulkTrackView = (reelIds, userId) => {
    if (!reelIds || !reelIds.length || !userId) return;

    reelIds.forEach(reelId => {
        trackActivity({
            userId,
            action: 'view',
            reelId
        });
    });
};

module.exports = {
    trackActivity,
    bulkTrackView
};
