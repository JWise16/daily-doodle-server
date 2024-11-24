// server/routes/doodleRoutes.js
const express = require('express');
const { uploadDoodle, listDoodles } = require('../controllers/doodleController');

const router = express.Router();

router.post('/upload', uploadDoodle);
router.get('/list', listDoodles);  // New route for listing doodles

module.exports = router;
