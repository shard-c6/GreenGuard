const express = require('express');
const router = express.Router();
const post = require('../controllers/post.controller');
const comment = require('../controllers/comment.controller');
const authMiddleware = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');
const upload = require('../middleware/upload');

router.use(authMiddleware);

// Feed & bookmarks (must come before /:id)
router.get('/bookmarks', post.myBookmarks);
router.get('/', post.getFeed);

// CRUD
router.post('/', requireRole('ngo'), upload.array('images', 5), post.createPost);
router.get('/:id', post.getPost);
router.delete('/:id', requireRole('ngo'), post.deletePost);

// Interactions
router.post('/:id/like', post.toggleLike);
router.post('/:id/bookmark', post.toggleBookmark);

// Comments
router.get('/:postId/comments', comment.listComments);
router.post('/:postId/comments', comment.addComment);
router.delete('/:postId/comments/:commentId', comment.deleteComment);

module.exports = router;
