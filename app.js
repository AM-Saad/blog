const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const mongoose = require("mongoose");

const app = express();

const MONGODBURI = `mongodb+srv://abdelrhman:ingodwetrust@onlineshop-zsiuv.mongodb.net/spot_blog`;

const store = new MongoDBStore({
  uri: MONGODBURI,
  collection: "sessions"
});




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


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));


app.use((req, res, next) => {
  if (!req.session) return next();
  // let token = req.csrfToken();
  console.log(req.query.lang);
  const user = req.session.user
  req.isLoggedIn = req.session.isLoggedIn
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.isAdmin = req.session.isAdmin;
  res.locals.lang = req.query.lang ? req.query.lang : 'en'
  res.user = user;
  res.locals.csrfToken = 'token';

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
