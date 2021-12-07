const Admin = require("../models/Admin");
const Article = require("../models/Article");
const Subscriber = require("../models/Subscriber");
const Category = require("../models/Category");
const fs = require('fs')
const msg = require("../util/message");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const moment = require('moment')





exports.dashboard = async (req, res, next) => {
    const to = moment().format('YYYY-MM-DD')
    const from = moment().subtract(1, 'days').format('YYYY-MM-DD')
    const articles = await Article.find().skip(1).limit(5)
    const subscribers = await Subscriber.find().skip(1).limit(5)
    const totalArticles = await Article.find({}).countDocuments()
    const subscriperlength = await Subscriber.find({}).countDocuments()



    let totalSalesPrice = 0
    articles.forEach(s => {
        totalSalesPrice += s.totalPrice
    })
    return res.render(`admin/dashboard`, {
        users: [],
        orders: [],
        pageTitle: "Dashboard",
        path: "/admin/dashboard",
        articles: articles,
        isAuth: req.session.isLoggedIn,
        user: req.session.user,
        lang: res.locals.lang,
        totalSalesPrice: totalSalesPrice,
        subscriperlength: subscriperlength,
        totalArticles: totalArticles,
        subscribers: subscribers,
        lang: res.locals.lang || 'en'
    });
};




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
        const user = await Admin.findOne({ mobile: mobile })
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
            if (err) {
                return res.redirect(`/admin/login?lang=${res.locals.lang || 'en'}`)

            }
            return res.redirect(`/admin/articles?lang=${res.locals.lang || 'en'}`)
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
    const lang = req.body.lang
    const active = req.body.active
    // const tags = JSON.parse(req.body.tags);
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
            // tags: tags,
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
            slug: title.replace(/\s+/g, '-')
        });

        await article.save();
        return res.status(201).json({
            message: 'Created',
            messageType: 'success',
            article: article
        });
    } catch (error) {

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
            if (article.image) {
                const relative_path = process.cwd()
                fs.unlinkSync(relative_path + '/' + article.image);
            }
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
        article.slug = title.replace(/\s+/g, '-')

        await article.save();
        return res.status(200).json({ message: 'Article Updated', messageType: 'success', article: article });
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
        if (article.image) {
            const relative_path = process.cwd()
            fs.unlinkSync(relative_path + '/' + article.image);
        }
        if (!article) return res.status(404).json({ message: 'Somthing went wrong. Please try again.', messageType: 'warning' })
        await article.remove()
        return res
            .status(200)
            .json({ message: "article Delete", messageType: 'success', articleId: articleId });
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
            image: req.files ? req.file.path.replace("\\", "/") : '',
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
        category.image = req.files.length > 0 ? req.files[0].path.replace("\\", "/") : category.image

        await category.save()
        return res.status(200).json({ message: `${res.locals.lang == 'en' ? 'Edited' : 'تم التعديل '}`, messageType: 'success', category: category })


    } catch (error) {
        return res.status(500).json({ message: `${res.locals.lang == 'en' ? 'Something went worng, please try again' : 'برجاء اعاده تشغيل الصفحه و المحاوله مره اخري'}`, messageType: 'danger' })

    }
}






exports.deleteCategory = async (req, res, next) => {
    const groupId = req.params.id
    const withItems = req.query.itemsState
    try {
        const category = await Category.findOne({ _id: groupId })

        await Article.updateMany({ 'category.name': category.name }, { 'category.name': 'default', 'category.subCategory': null })

        await category.remove()
        return res.status(200).json({ message: `${res.locals.lang == 'en' ? 'Deleted' : 'تم الحذف '}`, messageType: 'success' })
    } catch (error) {
        return res.status(500).json({ message: `${res.locals.lang == 'en' ? 'Something went worng, please try again' : 'برجاء اعاده تشغيل الصفحه و المحاوله مره اخري'}`, messageType: 'danger' })
    }
}



exports.uploadImage = async (req, res, next) => {
    if (req.file) return res.status(200).json('/' + req.file.path.replace("\\", "/"))
}


exports.deleteImage = async (req, res, next) => {
    const name = req.body.name
    return fs.unlink(`.${name}`, function (error) {
        if (error) return res.status(500).json({ message: 'Something went wrong, please try again.', messageType: 'danger' })
    });

}





exports.settings = async (req, res, next) => {
    const msgs = msg(req, res)

    try {
        const user = await Admin.findById(req.session.user._id)
        if (!user) {
            req.flash('alert', `${res.locals.lang == 'en' ? 'Something went worng, Re-login please' : 'برجاء اعاده تسجيل الدخول و المحاوله مره اخري'}`)
            return res.redirect('/admin/settings')
        }
        return res.render(`admin/settings`, {
            user: user,
            pageTitle: `${user.name}`,
            path: '/admin/settings',
            errmsg: msgs.err,
            succmsg: msgs.success,
            isAuth: req.session.isLoggedIn,
            user: req.session.user,
            lang: res.locals.lang


        })
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
}



exports.newAdmin = async (req, res, next) => {
    const { name, mobile, password, confirmPassword } = req.body
    try {
        if (!mobile || !name) {
            req.flash('alert', `${res.locals.lang == 'en' ? 'Mobile and name are required' : 'ادخل الاسم و رقم الموبايل'}`)
            return res.redirect('/admin/settings')
        }
        if (!password) {
            req.flash('alert', `${res.locals.lang == 'en' ? 'Add password' : 'ادخل رقم المرور'}`)
            return res.redirect('/admin/settings')
        }
        if (password != confirmPassword) {
            req.flash('alert', `${res.locals.lang == 'en' ? 'Password Not match' : 'رقم المرور غير متطابق'}`)
            return res.redirect('/admin/settings')
        }
        const hashedPassword = await bcrypt.hash(password, 12)
        const newAdmin = new Admin({
            name: name,
            mobile: mobile,
            password: hashedPassword,
            isAdmin: true
        })
        await newAdmin.save()
        req.flash('success', `${res.locals.lang == 'en' ? 'Created' : 'تم الانشاء'}`)
        return res.redirect('/admin/settings')

    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }

}

exports.updateInfo = async (req, res, next) => {
    const { mobile, name, bio, resume } = req.body
    try {
        const user = await Admin.findOne({ _id: req.session.user._id })
        if (!user) {
            req.flash('alert', `${res.locals.lang == 'en' ? 'Something went worng, Re-login please' : 'برجاء اعاده تسجيل الدخول و المحاوله مره اخري'}`)
            return res.redirect('/admin/settings')
        }

        if (!mobile || !name) {
            req.flash('alert', `${res.locals.lang == 'en' ? 'Mobile and name are required' : 'ادخل الاسم و رقم الموبايل'}`)
            return res.redirect('/admin/settings')
        }

        user.mobile = mobile
        user.name = name
        user.bio = bio
        user.resume = resume
        await user.save()
        req.flash('success', `${res.locals.lang == 'en' ? 'Edited' : 'تم التعديل'}`)
        return res.redirect('/admin/settings')


    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }

}
exports.changePassword = async (req, res, next) => {
    const { oldPassword, newPassword, confirmPassword } = req.body
    try {
        const user = await Admin.findOne({ _id: req.session.user._id })
        if (!user) {
            req.flash('alert', `${res.locals.lang == 'en' ? 'Something went worng, Re-login please' : 'برجاء اعاده تسجيل الدخول و المحاوله مره اخري'}`)
            return res.redirect('/admin/settings')
        }
        const isMatched = await bcrypt.compare(oldPassword, user.password)
        if (!isMatched) {
            req.flash('alert', `${res.locals.lang == 'en' ? 'Old password incorrect' : ' خطأ في رقم المرور القديم'}`)
            return res.redirect('/admin/settings')
        }
        if (newPassword != confirmPassword) {
            req.flash('alert', `${res.locals.lang == 'en' ? 'Password Not match' : 'رقم المرور غير متطابق'}`)

            return res.redirect('/admin/settings')
        }
        const hashedPassword = await bcrypt.hash(newPassword, 12)
        user.password = hashedPassword
        await user.save()
        req.flash('success', `${res.locals.lang == 'en' ? 'Passwrod Changed' : 'تم تغير رقم المرور'}`)

        return res.redirect('/admin/settings')


    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }

}

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        return res.redirect("/");
    });
};


