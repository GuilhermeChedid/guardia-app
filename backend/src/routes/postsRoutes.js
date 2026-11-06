const express = require('express');
const multer = require('multer');
const router = express.Router();
const controller = require('../controllers/postsController');
const postUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
        callback(null, ['image/jpeg', 'image/jpg', 'image/png'].includes(file.mimetype));
    },
});

router.get('/', controller.listPosts);
router.post('/upload-image', postUpload.single('image'), controller.uploadPostImage);
router.post('/', controller.createPost);
router.put('/:postId', controller.updatePost);
router.delete('/:postId', controller.deletePost);
router.post('/:postId/like', controller.toggleLike);
router.post('/:postId/comments', controller.addComment);

module.exports = router;
