const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csurf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');

const errorControllers = require('./controllers/errors.js');
const User = require('./models/user.js');

const MONGODB_URI = "mongodb+srv://Mike:T0wtSsPws1dOPuFL@cluster.8oboqne.mongodb.net/shop";

const app = express();
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});
const csrfProtection = csurf();


// Handles image file storage
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        cb(null, `${new Date().toISOString()}-${file.originalname}`);
    }
});

// Handles image file type 
const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg") {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin.js');
const shopRoutes = require('./routes/shop.js');

const authRoutes = require('./routes/auth.js');


app.use(bodyParser.urlencoded({ extended: false }));

app.use(multer({ fileStorage, fileFilter }).single('image'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'my secret', resave: false, saveUninitialized: false, store: store }))
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            if (!user) {
                return next();
            }
            req.user = user;
            next();
        })
        .catch(err => {
            next(new Error(err))
        });
});


app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(authRoutes);


app.get('/500', errorControllers.get500);

app.use(errorControllers.get404);

app.use((error, req, res, next) => {
    // res.redirect('/500');
    res.status(500).render('500', {
        pageTitle: 'Server Error!',
        path: '/500',
        isAuthenticated: req.session.isLoggedIn
    });
})


mongoose.connect(MONGODB_URI)
    .then(result => {
        app.listen(3000);
    })
    .catch(err => {
        console.log(err);
    });