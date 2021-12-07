
const Article = require("../models/Article");
const Category = require("../models/Category");
const Bookmark = require("../models/Bookmark");
const { updateBookmark, createBookmark, } = require("../util/bookmark");
const fs = require('fs')
exports.home = async (req, res, next) => {
    try {
        const articles = await Article.find();
  
        const categories = await Category.find({});
        if (!articles) {
            const error = new Error("Could not find articles.");
            error.statusCode = 404;
            throw error;
        }
        return res.render("home", {
            title: 'Abdelrahman Saad | Home',
            articles: articles,
            topics: categories,
            path: '/',
            pageKeywords: 'Abdelrahman, Abdelrahman saad, Web developer, javascript, web development, node.js, vue.js, js',
            pageDescription: "Hello, I'm Abdelrahman Saad, a web developer passionate about tech in general and javascript, I have a strong background in marketing and graphic design. "
        });

    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
}

exports.me = async (req, res, next) => {
    try {
        const categories = await Category.find({});
        return res.render("me", {
            title: 'Abdelrahman Saad | Home',
            topics: categories,
            path: '/me',
            pageKeywords: 'Web developer, javascript, web development, node.js, vue.js, js, abdelrahman, abdelrahman saad',
            pageDescription: "Hello, I'm Abdelrahman Saad, a web developer passionate about tech in general and javascript, I have a strong background in marketing and graphic design. "

        });

    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
}

exports.topics = async (req, res, next) => {
    const itemPerPage = 10;
    const pageNum = +req.query.page || 1;
    try {
        let query = req.params.topic === 'all' ? { active: true } : { active: true, 'category.name': req.params.topic }
        const articles = await Article.find(query).skip((pageNum - 1) * itemPerPage)
            .limit(itemPerPage)
        const categories = await Category.find({});
        const totalItems = await Article.find(query).countDocuments()
        if (!articles) {
            const error = new Error("Could not find articles.");
            error.statusCode = 404;
            throw error;
        }
        return res.render("articles", {
            title: `${req.params.topic} | Abdelrahman`,
            articles: articles,
            topics: categories,
            path: req.params.topic,
            pageKeywords: `${req.params.topic}, javascript, github, git, node.js, nodejs, `,
            pageDescription: `Know more about ${req.params.topic} and beyond`,
            currentPage: pageNum,
            hasNextPage: itemPerPage * pageNum < totalItems,
            hasPrevPage: pageNum > 1,
            nextPage: pageNum + 1,
            prevPage: pageNum - 1,
            lastPage: Math.ceil(totalItems / itemPerPage),
        });

    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
}


exports.article = async (req, res, next) => {
    try {
        const article = await Article.findOne({ slug: req.params.slug });
        const categories = await Category.find({});
        let similar = await Article.find({ "category.name": article.category.name })
        similar = similar.filter(i => i._id.toString() !== article._id.toString())
     
        if (!article) {
            const error = new Error("Could not find matched article.");
            error.statusCode = 404;
            throw error;
        }
        return res.render("article", {
            title: `${article.title} | Abdelrahman`,
            article: article,
            topics: categories,
            path: article.title,
            pageKeywords: article.tags.join(", "),
            pageDescription: article.description,
            similar: similar
        });

    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
}




exports.bookmarkPage = async (req, res, next) => {

    try {

        const categories = await Category.find({});
        return res.render("bookmark", {
            title: 'Bookmark | Abdelrahman',
            topics: categories,
            path: '/bookmark',
            pageKeywords: `javascript, github, git, node.js, nodejs, `,
            pageDescription: "Hello I'm Abelrahman, i'm a web developer passionate about tech but also have a strong background in marketing and graphic design. Here we are going to discover all the things related to the tech industry as much as i can to simplify what i have learned until now in order to make your journey more fun"

        });
    } catch (err) {

        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);

    }
};





exports.bookmarks = async (req, res, next) => {
    let bookmardId = req.params.id

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

exports.updateBookmark = async (req, res, next) => {
    const itemId = req.params.id;
    let bookmardId = req.query.bookmark

    try {
        const article = await Article.findById(itemId)

        if (!bookmardId || bookmardId == 'null' || bookmardId == 'undefined') {
            const newBookmark = createBookmark(Bookmark)
            await newBookmark.save()
            bookmardId = newBookmark.sessionId
        }

        const bookmark = await Bookmark.findOne({ sessionId: bookmardId })
        if (!bookmark) {
            return res.status(404).json({ message: 'Something went wrong', messageType: 'alert' });
        }
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



exports.addComment = async (req, res, next) => {
    const id = req.params.id;
    const comment = req.body.comment;
    try {
      const user = await User.findOne({ _id: req.user.id });
      if (!user) {
        console.log("no");
      }
  
      const article = await Article.findOne({ _id: id });
  
      let newComment = {
        userId: user._id,
        username: user.name,
        userPicture: user.profilePicture,
        comment: comment
      };
  
      article.comments.push(newComment);
      await article.save();
      res.status(200).json(article);
    } catch (err) {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    }
  };
  
  exports.getComments = async (req, res, next) => {
    const id = req.params.id;
  
    try {
      const article = await Article.findOne({ _id: id });
      const comments = article.comments;
  
      return res.status(200).json(comments);
    } catch (error) {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    }
  };
  
  exports.react = async (req, res, next) => {
    const id = req.params.id;
    const react = req.query.react
    let bookmardId = req.query.bookmark
  
    try {
      const article = await Article.findById(id);
      if (!article) {
        const error = new Error("No article Found..");
        error.statusCode = 401;
        next(error);
        throw error;
      }
  
      const index = article.reactions[react].users.findIndex(u => u.id.toString() === bookmardId.toString())
  
      if (index <= -1) {
        article.reactions[react].users.push({ id: bookmardId })
        article.reactions[react].counter += 1
      } else {
        article.reactions[react].users = article.reactions[react].users.filter(u => u.id.toString() != bookmardId.toString())
        article.reactions[react].counter -= 1
      }
  
      await article.save();
      return res.status(200).json({ message: "Liked", reactions: article.reactions });
    } catch (error) {
      error.statusCode = 500;
      return next(error);
    }
  };
  
  exports.getLikes = async (req, res, next) => {
    const id = req.params.id;
  
    try {
      const article = await Article.findOne({ _id: id });
      if (!article) {
        const error = new Error("No article Found..");
        error.statusCode = 401;
        return next(error);
      }
      const likes = article.like;
      return await res.status(200).json({ likes: likes });
    } catch (error) {
      console.log(error);
      error.statusCode = 500;
      return next(error);
    }
  };
  
  
  exports.newView = async (req, res, next) => {
    const id = req.params.id
    const item = req.query.item
  
    try {
      if (item == 'article') {
        console.log(item);
        await Article.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true })
      }
      return res.status(200).json({ message: 'ok' })
    } catch (error) {
      error.statusCode = 500;
      return next(error);
    }
  }
