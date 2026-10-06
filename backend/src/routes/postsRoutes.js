const express = require('express');
const router = express.Router();
const controller = require('../controllers/postsController');

router.get('/', controller.listPosts);
router.post('/', controller.createPost);
router.put('/:postId', controller.updatePost);
router.delete('/:postId', controller.deletePost);
router.post('/:postId/like', controller.toggleLike);
router.post('/:postId/comments', controller.addComment);

module.exports = router;
