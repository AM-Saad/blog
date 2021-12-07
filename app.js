const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const mongoose = require("mongoose");
const multer = require("multer");
const uuidv4 = require("uuid/v4");
const flash = require('connect-flash');
const { SitemapStream, streamToPromise } = require('sitemap')
const { createGzip } = require('zlib')
const csrf = require("csurf");
var cors = require('cors');
const Article = require("./models/Article");
const Category = require("./models/Category");

const app = express();

let sitemap

const MONGODBURI = `mongodb+srv://abdelrhman:ingodwetrust@onlineshop-zsiuv.mongodb.net/ams_blog`;

const store = new MongoDBStore({
  uri: MONGODBURI,
  collection: "sessions"
});



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4());
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const csrfProtection = csrf();


app.set('trust proxy', true);
app.use(cors()) // Use this after the variable declaration

app.use(multer({ storage: storage, fileFilter: fileFilter }).single("image"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "/public")));
app.use("/images", express.static(path.join(__dirname, "images")));

app.set("view engine", "ejs");
app.set("views", "views");


app.get('/sitemap.xml', async function (req, res) {

  res.header('Content-Type', 'application/xml');
  res.header('Content-Encoding', 'gzip');

  if (sitemap) {
    res.send(sitemap)
    return
  }

  try {
    const allArticles = await Article.find({ active: true }).select('slug')
    const allCategories = await Category.find().select('name')
    const articles = allArticles.map(({ slug }) => `/article/${slug}`)
    const categories = allCategories.map(({ name }) => `/articles/${name}`)
    // Change yourWebsite.com to your website's URL
    const smStream = new SitemapStream({ hostname: 'https://abdelrahman-saad.cc/' })
    const pipeline = smStream.pipe(createGzip())

    // Add each article URL to the stream
    articles.forEach(function (item) {
      // Update as required
      smStream.write({ url: item, changefreq: 'weekly', priority: 0.8 })
    });

    // Add each category URL to the stream
    categories.forEach(function (item) {
      // Update as required
      smStream.write({ url: item, changefreq: 'monthly', priority: 0.6 })
    });
    smStream.write({ url: '/', changefreq: 'monthly', priority: 0.6 })
    smStream.write({ url: '/me', changefreq: 'monthly', priority: 0.6 })

    // cache the response
    streamToPromise(pipeline).then(sm => sitemap = sm)

    smStream.end()

    // Show errors and response
    pipeline.pipe(res).on('error', (e) => { throw e })
  } catch (e) {
    console.error(e)
    res.status(500).end()
  }
})





app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);
app.use(flash());


const main = require('./routes/main');
const adminRoutes = require("./routes/admin");
app.use(csrfProtection);

app.use((req, res, next) => {
  let token = req.csrfToken();
  res.locals.isLoggedIn = req.session.isLoggedIn;
  res.locals.isAdmin = req.session.isAdmin;
  res.locals.csrfToken = token;
  res.locals.lang = req.query.lang ? req.query.lang : 'en'
  next();
});


app.use((req, res, next) => {
  if (!req.session) return next();
  const user = req.session.user
  res.user = user;
  next();

});


app.use(main)
app.use('/admin', adminRoutes);


app.use((error, req, res, next) => {
  console.log(error);
  return res.status(500).render("500", {
    pageTitle: "Error!",
    path: "/500",
  });
});


app.get('*', function(req, res){
  return res.status(404).render("404", {
    pageTitle: "Error!",
    path: "/404",
});

});



mongoose
  .connect(MONGODBURI)
  .then(result => {
    console.log("conncted on 3000");
    app.listen(3000)
  })
  .catch(err => {
    console.log("err" + err);
  });
