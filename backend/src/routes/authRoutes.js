const express = require('express');
const router = express.Router();

const {
    register,
    login,
    verifyProofPin,
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
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-proof-pin', verifyProofPin);
router.get('/profile/:usuarioId', getProfile);
router.put('/profile/:usuarioId', updateProfile);
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