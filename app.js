const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const mongoose = require("mongoose");
const multer = require("multer");
const uuidv4 = require("uuid/v4");

const csrf = require("csurf");
var cors = require('cors');

const app = express();

const MONGODBURI = `mongodb+srv://abdelrhman:ingodwetrust@onlineshop-zsiuv.mongodb.net/spot_blog`;

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
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

app.set("view engine", "ejs");
app.set("views", "views");





app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);


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



// mongoConnect(() => { });


mongoose
  .connect(MONGODBURI)
  .then(result => {
    console.log("conncted...");
    app.listen(3000)
  })
  .catch(err => {
    console.log("err" + err);
  });
