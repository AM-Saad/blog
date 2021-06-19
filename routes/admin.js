
const express = require('express');
const adminControllers = require('../controllers/admin');
const isAdmin = require('../middleware/is-admin')
const router = express.Router();


router.get('/', adminControllers.getLogin);
router.get('/login', adminControllers.getLogin);
router.post('/login', adminControllers.postLogin);
router.get('/logout', adminControllers.postLogout);


router.get("/articles", adminControllers.articlespage);

router.get("/api/articles", isAdmin, adminControllers.articles);
router.get("/api/articles/:id", isAdmin, adminControllers.getArticle);
router.post("/api/articles", isAdmin, adminControllers.createArticle);
router.delete("/api/articles/:id", isAdmin, adminControllers.deleteArticle);
router.put("/api/articles/:id", isAdmin, adminControllers.editArticle);



router.get('/category', isAdmin, adminControllers.category);
router.get('/api/category', isAdmin, adminControllers.getCategory);
router.post('/api/category', isAdmin, adminControllers.createCategory);
router.put('/api/category/:id', isAdmin, adminControllers.editCategory);
router.delete('/api/category/:id', isAdmin, adminControllers.deleteCategory);




module.exports = router;