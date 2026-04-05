const express = require('express');
const router = express.Router();
const profile = require('../controllers/profile.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/:userId', profile.getProfile);
router.get('/:userId/posts', profile.getUserPosts);
router.get('/:userId/plants', profile.getUserPlants);
router.post('/:userId/follow', profile.follow);
router.delete('/:userId/follow', profile.unfollow);
router.get('/:userId/followers', profile.getFollowers);
router.get('/:userId/following', profile.getFollowing);

module.exports = router;
