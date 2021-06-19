
const Article = require("../models/Article");
const Category = require("../models/Category");
const fs = require('fs')

exports.home = async (req, res, next) => {
    try {
        const articles = await Article.find({ active: true });
        const categories = await Category.find({});
        console.log(articles)
        // var json = JSON.stringify(articles);
        // fs.writeFile('data.json', json, 'utf8', callback);
    

        // console.log(all);
        if (!articles) {
            const error = new Error("Could not find articles.");
            error.statusCode = 404;
            throw error;
        }
        return res.render("home", {
            articles: articles,
            topics: categories,
            path: '/'
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
            articles: articles,
            topics: categories,
            path: `${req.params.topic}`
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
            article: article,
            topics: categories,
            path: '/'
        });

    } catch (error) {
        console.log(error)
    }
}
