// Load environment variables if not in production
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

// Import necessary modules
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate'); // EJS layout engine
const session = require('express-session');
const flash = require('connect-flash'); // For flash messages
const ExpressError = require('./utils/ExpressError'); // Custom error class
const methodOverride = require('method-override'); // Allows HTTP verbs like PUT or DELETE
const passport = require('passport');
const LocalStrategy = require('passport-local'); // Authentication strategy
const User = require('./models/user'); // User model
const helmet = require('helmet'); // Security middleware
const MongoStore = require('connect-mongo'); // MongoDB session store
const mongoSanitize = require('express-mongo-sanitize'); // Prevent MongoDB injection
const job = require('./cron.js'); // Importing a scheduled job

// Route handlers
const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

// Database URL (local or environment-based)
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/campx';

// Start the cron job
job.start();

// Connect to MongoDB
mongoose.connect(dbUrl);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express(); // Initialize the Express app

// Set EJS as the template engine with ejsMate for layouts
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Set views directory

// Middleware setup
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(methodOverride('_method')); // Support for PUT and DELETE methods
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files
app.use(mongoSanitize({ replaceWith: '_' })); // Sanitize input to prevent MongoDB injections

// Make the current URL path available to EJS templates
app.use((req, res, next) => {
    res.locals.currentPath = req.path;
    next();
});

// Configure session store with MongoDB
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60, // Update session only once per 24 hours
    crypto: { secret: 'thisshouldbeabettersecret!' } // Encryption key
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e);
});

// Session configuration
const sessionConfig = {
    store,
    name: 'session', // Custom session cookie name
    secret: 'thisshouldbeabettersecret!', // Encryption secret
    resave: false, // Don't save unchanged sessions
    saveUninitialized: true, // Save uninitialized sessions
    cookie: {
        httpOnly: true, // Prevent client-side JS from accessing the cookie
        // secure: true, // Enable for HTTPS
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // Expiration in 7 days
        maxAge: 1000 * 60 * 60 * 24 * 7 // Cookie valid for 7 days
    }
};

app.use(session(sessionConfig)); // Use session middleware
app.use(flash()); // Flash messages middleware
app.use(helmet()); // Use Helmet for security

// Helmet Content Security Policy (CSP) configuration
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];

// Apply CSP to restrict external resource loading
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dgr21eiov/", // Cloudinary account
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

// Initialize Passport.js for authentication
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); // Use local strategy for login

// Serialize and deserialize user instances to and from the session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Set local variables for flash messages and current user
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// Route handlers
app.use('/', userRoutes); // User routes
app.use('/campgrounds', campgroundRoutes); // Campgrounds routes
app.use('/campgrounds/:id/reviews', reviewRoutes); // Review routes

// Home route
app.get('/', (req, res) => {
    res.render('home');
});

// Catch-all route for unsupported HTTP methods on specific routes
app.all('/', (req, res, next) => {
    next(new ExpressError('Method not allowed', 405));
});
app.all('/campgrounds', (req, res, next) => {
    next(new ExpressError('Method not allowed', 405));
});
app.all('/campgrounds/:id/reviews', (req, res, next) => {
    next(new ExpressError('Method not allowed', 405));
});

// Catch-all for 404 errors
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

// Global error handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something Went Wrong!';
    res.status(statusCode).render('error', { err });
});

// Start the server on port 3000
app.listen(3000, () => {
    console.log('Serving on port 3000');
});
