
const express = require('express');
const mainControllers = require('../controllers/main');
const router = express.Router();

router.get("/", mainControllers.home);
router.get("/me", mainControllers.me);
router.get("/article/:name", mainControllers.article);
router.get("/articles/:topic", mainControllers.topics);
router.get("/bookmarks/", mainControllers.bookmarkPage);
router.get("/api/bookmarks/", mainControllers.bookmarks);
router.post("/api/bookmarks/:id", mainControllers.updateBookmark);
router.get('/api/search', mainControllers.search);

module.exports = router;