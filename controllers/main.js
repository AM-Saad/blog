
const Article = require("../models/Article");
const Category = require("../models/Category");
const Bookmark = require("../models/Bookmark");
const { updateBookmark, createBookmark, } = require("../util/bookmark");
const fs = require('fs')

exports.home = async (req, res, next) => {
    try {
        const articles = await Article.find({ active: true });
        const categories = await Category.find({});
        // var json = JSON.stringify(articles);
        // fs.writeFile('data.json', json, 'utf8', callback);
        // await Bookmark.deleteMany({})
        if (!articles) {
            const error = new Error("Could not find articles.");
            error.statusCode = 404;
            throw error;
        }
        return res.render("home", {
            title: 'Home | Abdelrahman',
            articles: articles,
            topics: categories,
            path: '/'
        });

    } catch (error) {
        console.log(error)
    }
}

exports.me = async (req, res, next) => {
    try {
        const categories = await Category.find({});
        return res.render("me", {
            title: 'Me',
            topics: categories,
            path: '/me'
        });

    } catch (error) {
        console.log(error)
    }
}

exports.topics = async (req, res, next) => {
    try {
        const articles = await Article.find({ active: true, 'category.name': req.params.topic });
        const categories = await Category.find({});

        if (!articles) {
            const error = new Error("Could not find articles.");
            error.statusCode = 404;
            throw error;
        }
        return res.render("articles", {
            title: `${req.params.topic} | Abdelrahman`,
            articles: articles,
            topics: categories,
            path: req.params.topic
        });

    } catch (error) {
        console.log(error)
    }
}


exports.article = async (req, res, next) => {
    try {
        const article = await Article.findOne({ title: req.params.name });
        const categories = await Category.find({});
        if (!article) {
            const error = new Error("Could not find matched article.");
            error.statusCode = 404;
            throw error;
        }
        return res.render("article", {
            title: `${article.title} | Abdelrahman`,
            article: article,
            topics: categories,
            path: article.title
        });

    } catch (error) {
        console.log(error)
    }
}





exports.bookmarks = async (req, res, next) => {
    let bookmardId = req.query.bookmark

    try {
        if (!bookmardId || bookmardId == 'null' || bookmardId == 'undefined') {
            const newBookmark = createBookmark(Bookmark)
            await newBookmark.save()
            bookmardId = newBookmark.sessionId
        }
        const bookmark = await Bookmark.findOne({ sessionId: bookmardId })
        if (!bookmark) return res.status(404).json({ message: 'Something went wrong', messageType: 'alert' })
        return res.status(200).json({ message: `Done`, messageType: 'success', bookmark: bookmark });

    } catch (err) {

        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);

    }
};

exports.bookmarkPage = async (req, res, next) => {
    let bookmardId = req.query.bookmark

    try {
        if (!bookmardId || bookmardId == 'null' || bookmardId == 'undefined') {
            const newBookmark = createBookmark(Bookmark)
            await newBookmark.save()
            bookmardId = newBookmark.sessionId
        }
        const bookmark = await Bookmark.findOne({ sessionId: bookmardId })
        if (!bookmark) return res.redirect('/')

        const categories = await Category.find({});
        return res.render("bookmark", {
            title: 'Bookmark | Abdelrahman',
            articles: bookmark.items,
            topics: categories,
            bookmardId: bookmardId,
            path: '/bookmark'
        });
    } catch (err) {

        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);

    }
};


exports.updateBookmark = async (req, res, next) => {
    const prodId = req.params.id;
    let bookmardId = req.query.bookmark
    console.log(bookmardId);
    try {
        const article = await Article.findById(prodId)

        if (!bookmardId || bookmardId == 'null' || bookmardId == 'undefined') {
            const newBookmark = createBookmark(Bookmark)
            await newBookmark.save()
            bookmardId = newBookmark.sessionId
        }

        const bookmark = await Bookmark.findOne({ sessionId: bookmardId })
        if (!bookmark) {
            return res.status(404).json({ message: 'Something went wrong', messageType: 'alert' });
        }
        console.log(bookmark);
        const { items, added } = updateBookmark(bookmark.items, article, req.body, res)
        bookmark.items = items;

        await bookmark.save();
        return res.status(200).json({ message: `Article ${added ? 'Saved' : 'Removed'}`, messageType: 'success', bookmark: bookmark, items: items, added: added });
    } catch (err) {
        console.log(err);

        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);

    }
};






exports.search = async (req, res, next) => {
    let searchValue = req.query.q;
    try {
        let products = []
        if (searchValue) {
            var regxValue = new RegExp(searchValue, "i");
            products = await Article.find({ title: regxValue })
            return res.status(200).json({ products: products })
        }
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
}
