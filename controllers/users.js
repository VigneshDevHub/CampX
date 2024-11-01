const User = require('../models/user'); // Import the User model to interact with the user database
const {ROLE_USER , ROLE_ADMIN} = require('../utils/constant');
/**
 * Renders the registration page.
 * 
 * Route: GET /register
 */
module.exports.renderRegister = (req, res) => {
    res.render('users/register'); // Render the 'register' view from the 'users' directory
};

/**
 * Handles user registration logic.
 * - Assigns the first user as 'admin' and subsequent users as 'user'.
 * - Registers the user with hashed password and logs them in upon success.
 * - On failure, redirects back to the registration page with an error message.
 * 
 * Route: POST /register
 */
module.exports.register = async (req, res, next) => {
    let userCount = await User.countDocuments(); // Count existing users to determine the role
    let role = userCount === 0 ? ROLE_ADMIN : ROLE_USER; // First user becomes admin, others become regular users

    try {
        const { email, username, password } = req.body; // Extract user data from the request body
        const user = new User({ email, username, role }); // Create a new user instance with assigned role
        const registeredUser = await User.register(user, password); // Register user and hash password

        // Log the user in after successful registration
        req.login(registeredUser, err => {
            if (err) return next(err); // Pass any errors to the next middleware
            req.flash('success', 'Welcome to CampX!'); // Flash a success message
            res.redirect('/campgrounds'); // Redirect to the campgrounds page
        });

    } catch (e) {
        req.flash('error', e.message); // Flash error message on failure
        res.redirect('/register'); // Redirect back to the registration form
    }
};

/**
 * Renders the login page.
 * 
 * Route: GET /login
 */
module.exports.renderLogin = (req, res) => {
    res.render('users/login'); // Render the 'login' view from the 'users' directory
};

/**
 * Handles user login.
 * - Flashes a welcome message upon successful login.
 * - Redirects to the originally requested page or to '/campgrounds' by default.
 * 
 * Route: POST /login
 */
module.exports.login = (req, res) => {
    req.flash('success', 'Welcome back!'); // Flash a success message
    const redirectUrl = res.locals.returnTo || '/campgrounds'; // Redirect to the stored URL or default route
    delete req.session.returnTo; // Clear the stored URL from session
    res.redirect(redirectUrl); // Redirect to the appropriate page
};

/**
 * Logs the user out.
 * - Uses `req.logout()` to destroy the session and logs out the user.
 * - Redirects to '/campgrounds' with a farewell message.
 * 
 * Route: GET /logout
 */
module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err); // Pass any errors to the next middleware
        }
        req.flash('success', 'Goodbye!'); // Flash a farewell message
        res.redirect('/campgrounds'); // Redirect to the campgrounds page
    });
};
