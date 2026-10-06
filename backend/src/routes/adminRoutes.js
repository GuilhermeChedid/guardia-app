const express = require('express');
const router = express.Router();
const controller = require('../controllers/adminController');

router.get('/users', controller.listUsers);
router.delete('/users/:userId', controller.deleteUser);
router.get('/reports/sos', controller.getReports);
router.post('/reports/sos/events', controller.registerSos);

module.exports = router;
