const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const {
    register,
    login,
    verifyProofPin,
    getProofPinStatus,
    getProfile,
    updateProfile,
    getContacts,
    createContact,
    updateContact,
    deleteContact,
    getEvidences,
    createEvidence,
    updateEvidence,
    deleteEvidence,
    getEvidenceHistory,
    updateProfilePhoto,
    deleteProfilePhoto,
} = require('../controllers/authController');

const profileUploadDirectory = path.resolve(__dirname, '../../uploads/profile');
fs.mkdirSync(profileUploadDirectory, { recursive: true });
const profileUpload = multer({
    storage: multer.diskStorage({
        destination: profileUploadDirectory,
        filename: (req, file, callback) => {
            const extension = path.extname(file.originalname).toLowerCase();
            callback(null, `${req.params.usuarioId}-${Date.now()}${extension}`);
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
        if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.mimetype)) {
            return callback(new Error('A foto deve estar no formato JPG, JPEG, PNG ou WEBP.'));
        }
        callback(null, true);
    },
});
const handleProfileUpload = (req, res, next) => {
    profileUpload.single('photo')(req, res, (error) => {
        if (!error) {
            next();
            return;
        }

        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({
                success: false,
                message: 'A foto deve ter no máximo 5 MB.',
            });
        }

        return res.status(400).json({
            success: false,
            message: error.message || 'Arquivo de foto inválido.',
        });
    });
};

router.post('/register', register);
router.post('/login', login);
router.post('/verify-proof-pin', verifyProofPin);
router.get('/proof-pin-status/:usuarioId', getProofPinStatus);
router.get('/profile/:usuarioId', getProfile);
router.put('/profile/:usuarioId', updateProfile);
router.post('/profile/:usuarioId/photo', handleProfileUpload, updateProfilePhoto);
router.delete('/profile/:usuarioId/photo', deleteProfilePhoto);
router.get('/contacts/:usuarioId', getContacts);
router.post('/contacts/:usuarioId', createContact);
router.put('/contacts/:usuarioId/:contactId', updateContact);
router.delete('/contacts/:usuarioId/:contactId', deleteContact);
router.get('/evidences/:usuarioId', getEvidences);
router.post('/evidences/:usuarioId', createEvidence);
router.put('/evidences/:usuarioId/:evidenceId', updateEvidence);
router.delete('/evidences/:usuarioId/:evidenceId', deleteEvidence);
router.get('/evidences/:usuarioId/history', getEvidenceHistory);

module.exports = router;