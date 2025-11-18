const express = require('express');
const router = express.Router();
const { answerQuery } = require('../Controllers/aiController'); 

router.post('/query', answerQuery);

module.exports = router;