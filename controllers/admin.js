
const Admin = require("../models/Admin");
const Article = require("../models/Article");
const Category = require("../models/Category");
const fs = require('fs')

// const msg = require("../util/message");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const moment = require('moment')

exports.getLogin = async (req, res, next) => {
    // console.log('here');
    //   const hashedPassword = await bcrypt.hash('bodakaka', 12)
    //   const newAdmin = new Admin({
    //     name: 'Abdelrahman',
    //     email:'abdelrahmanm525@gmail.com',
    //     mobile: '01156565910',
    //     password: hashedPassword,
    //     isAdmin: true
    //   })
    //   await newAdmin.save()
    //   console.log(newAdmin);
    // if (req.session.isLoggedIn && req.session.user.isAdmin) return res.redirect('/admin/dashboard')
    console.log('heer')
    return res.render(`admin/auth/login`, {
        path: "/admin/login",
        pageTitle: "Admin",
        errmsg: null,
        succmsg: null,
        isAuth: false,
        user: null,
        lang: res.locals.lang || 'en'

    });
};

exports.postLogin = async (req, res, next) => {
    const mobile = req.body.mobile;
    const password = req.body.password;
    try {
        const user = await Admin.findOne({})
        console.log(user);
        if (!user) {
            return res.render(`admin/auth/login`, {
                path: "/admin/login",
                pageTitle: "Admin",
                errmsg: `${res.locals.lang == 'en' ? 'Your information is incorrect' : 'برجاء التأكد من البيانات'}`,
                succmsg: null,
                isAuth: req.session.isLoggedIn,
                user: req.session.user,
                lang: res.locals.lang || 'en'
            });
        }

        const doMatch = await bcrypt.compare(password, user.password)
        if (!doMatch) {
            return res.render(`admin/auth/login`, {
                path: "/admin/login",
                pageTitle: "Admin",
                errmsg: `${res.locals.lang == 'en' ? 'Your information is incorrect' : 'برجاء التأكد من البيانات'}`,
                succmsg: null,
                isAuth: req.session.isLoggedIn,
                user: req.session.user,
                lang: res.locals.lang || 'en'
            });
        }
        req.session.isLoggedIn = true;
        req.session.user = user;
        req.session.isAdmin = true
        await req.session.save(err => {
            console.log(req.session);

            return res.redirect(`/admin/dashboard?lang=${res.locals.lang || 'en'}`)
        });
    } catch (error) {
        console.log(error);
    }

};


exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect("/");
    });
};




exports.articlespage = async (req, res, next) => {
    return res.render(`admin/articles`, {

        pageTitle: "articles",
        path: "/admin/articles",
        isAuth: req.session.isLoggedIn,
        user: req.session.user,
        lang: res.locals.lang || 'en'
    });
}



exports.articles = async (req, res, next) => {
    try {
        const articles = await Article.find();

        return await res.status(200).json({
            articles: articles
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};
exports.createArticle = async (req, res, next) => {
    const content = req.body.content;
    const title = req.body.title;
    const category = req.body.category;
    const sub = req.body.sub;
    const tags = JSON.parse(req.body.tags);
    const lang = req.body.lang
    const active = req.body.active
    const site_description = req.body.site_description
    // const delta = JSON.parse(req.body.delta);

    let image;
    if (req.file) {
        image = req.file.path.replace("\\", "/");
    } else {
        image = ''
    }
    try {
        const article = new Article({
            title: title,
            content: content,
            image: image,
            tags: tags,
            category: { name: category, sub: sub },
            shares: [],
            comments: [],
            reactions: {
                highfive: {
                    users: [],
                    counter: 0
                },
                like: {
                    users: [],
                    counter: 0
                },
                dislike: {
                    users: [],
                    counter: 0
                },
            },
            discussion: [],
            date: moment().format('YYYY-MM-DD'),
            time: moment().format('h:mm a'),
            lang: lang,
            active: active,
            site_description: site_description,
        });

        await article.save();
        return await res.status(201).json({
            message: 'Created',
            article: article
        });
    } catch (error) {
        console.log(error);


        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

exports.getArticle = async (req, res, next) => {
    const articleId = req.params.id;
    try {

        const article = await Article.findById(articleId);
        if (!article) return res.status(404).json({ message: 'Somthing went wrong. Please try again.', messageType: 'warning' })
        return res
            .status(200)
            .json({ article: article });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

exports.editArticle = async (req, res, next) => {
    const articleId = req.params.id;
    const content = req.body.content;
    const title = req.body.title;
    const category = req.body.category;
    const sub = req.body.sub;
    const tags = JSON.parse(req.body.tags);
    const lang = req.body.lang
    const active = req.body.active
    const site_description = req.body.site_description
    // const delta = JSON.parse(req.body.delta);

    try {
        let image;
        const article = await Article.findById(articleId)
        if (!article) { return res.status(404).json({ message: 'Somthing went wrong. Please try again.', messageType: 'warning' }) }
        if (req.file) {
            image = req.file.path.replace("\\", "/");
        } else {
            image = article.image
        }

        article.title = title
        article.content = content
        article.category = { name: category, sub: sub }
        article.image = image
        article.tags = tags
        article.lang = lang
        article.active = active
        article.site_description = site_description
        // article.delta = { ...delta }
        await article.save();
        return await res.status(200).json({ message: 'Article Updated', article: article });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

exports.deleteArticle = async (req, res, next) => {
    const articleId = req.params.id;
    try {
        const article = await Article.findById(articleId);
        if (!article) return res.status(404).json({ message: 'Somthing went wrong. Please try again.', messageType: 'warning' })
        await article.remove()
        return res
            .status(200)
            .json({ message: "article Delete", articleId: articleId });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};


exports.category = async (req, res, next) => {
    return res.render(`admin/category`, {
        users: [],
        orders: [],
        pageTitle: "category",
        path: "/admin/category",
        isAuth: req.session.isLoggedIn,
        user: req.session.user,
        lang: res.locals.lang || 'en'
    });
}



exports.getCategory = async (req, res, next) => {
    try {
        const categoryies = await Category.find()
        return res.status(200).json({ message: `${res.locals.lang == 'en' ? 'Done' : 'تم'}`, messageType: 'success', categories: categoryies })

    } catch (error) {
        console.log(error);

        return res.status(500).json({ message: `${res.locals.lang == 'en' ? 'Something went worng, please try again' : 'برجاء اعاده تشغيل الصفحه و المحاوله مره اخري'}`, messageType: 'danger' })
    }
}



exports.createCategory = async (req, res, next) => {
    console.log(req.body)
    const name = req.body.name.toLowerCase()
    const subCategories = JSON.parse(req.body.subCategories)
    const order = req.body.order
    const active = req.body.active
    const tag = JSON.parse(req.body.tag)
    try {
        if (!name) return res.status(401).json({ message: `${res.locals.lang == 'en' ? 'Add Category Name' : 'اضف اسم للتصنيف'}`, messageType: 'warning' })

        const newTopic = {
            name: name,
            order: order ? order : null,
            active: active ? active : true,
            subCategory: subCategories,
            image: req.files.length > 0 ? req.files[0].path.replace("\\", "/") : '',
            attributes: [],
            tag: tag
        }
        const cat = new Category(newTopic)
        await cat.save()
        return res.status(200).json({ message: `${res.locals.lang == 'en' ? 'Created' : 'تم الانشاء '}`, messageType: 'success', category: cat })


    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: `${res.locals.lang == 'en' ? 'Something went worng, please try again' : 'برجاء اعاده تشغيل الصفحه و المحاوله مره اخري'}`, messageType: 'danger' })

    }
}

exports.editCategory = async (req, res, next) => {
    const categoryId = req.params.id;
    try {

        const category = await Category.findOne({ _id: categoryId })
        if (!category) return res.status(404).json({ message: `${res.locals.lang == 'en' ? 'Something went worng, please try again' : 'برجاء اعاده تشغيل الصفحه و المحاوله مره اخري'}`, messageType: 'warning' })


        await Product.updateMany({ 'category.name': category.name }, { 'category.name': req.body.name.toLowerCase() })
        category.name = req.body.name.toLowerCase()
        category.order = req.body.order || null
        category.active = req.body.active || true
        category.tag = JSON.parse(req.body.tag)
        category.subCategory = JSON.parse(req.body.subCategories)
        category.image = req.files.length > 0 ? req.files[0].path.replace("\\", "/") : category.image,

            await category.save()
        return res.status(200).json({ message: `${res.locals.lang == 'en' ? 'Edited' : 'تم التعديل '}`, messageType: 'success', category: category })


    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: `${res.locals.lang == 'en' ? 'Something went worng, please try again' : 'برجاء اعاده تشغيل الصفحه و المحاوله مره اخري'}`, messageType: 'danger' })

    }
}






exports.deleteCategory = async (req, res, next) => {
    const groupId = req.params.id
    const withItems = req.query.itemsState
    try {
        const category = await Category.findOne({ _id: groupId })

        await Product.updateMany({ 'category.name': category.name }, { 'category.name': 'default', 'category.subCategory': null })



        await category.remove()
        return res.status(200).json({ message: `${res.locals.lang == 'en' ? 'Deleted' : 'تم الحذف '}`, messageType: 'success' })
    } catch (error) {
        console.log(error);

        return res.status(500).json({ message: `${res.locals.lang == 'en' ? 'Something went worng, please try again' : 'برجاء اعاده تشغيل الصفحه و المحاوله مره اخري'}`, messageType: 'danger' })
    }
}
