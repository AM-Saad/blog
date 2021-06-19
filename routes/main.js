
const express = require('express');
const mainControllers = require('../controllers/main');
const router = express.Router();

router.get("/", mainControllers.home);
router.get("/article/:name", mainControllers.article);
router.get("/articles/:topic", mainControllers.topics);

module.exports = router;