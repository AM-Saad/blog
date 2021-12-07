
const express = require('express');
const mainControllers = require('../controllers/main');
const router = express.Router();

router.get("/", mainControllers.home);
router.get("/me", mainControllers.me);
router.get("/article/:slug", mainControllers.article);
router.get("/articles/:topic", mainControllers.topics);
router.get("/bookmarks", mainControllers.bookmarkPage);
router.get("/api/bookmarks/:id", mainControllers.bookmarks);
router.post("/api/bookmarks/:id", mainControllers.updateBookmark);
router.get('/api/search', mainControllers.search);


router.put("/comments/:id", mainControllers.addComment);
router.get("/comments/:id", mainControllers.getComments);

router.put("/api/react/:id", mainControllers.react);
router.get("/likes/:id", mainControllers.getLikes);

router.put("/view/:id", mainControllers.newView);


module.exports = router;