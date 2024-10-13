const User = require('../models/user');
const {userRole , adminRole} = require('../utils/constant')

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

module.exports.register = async (req, res,next) => {
    let userCount = await User.countDocuments();
    let role = userCount === 0 ? adminRole : userRole;
    try{
        const { email, username, password } = req.body;
        const user = new User({ email, username,role });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err=>{
            if(err) return next(err);
            req.flash('success', 'Welcome to CampX!');
            res.redirect('/campgrounds');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
}

module.exports.renderLogin = (req,res)=>{
    res.render('users/login');
}

module.exports.login = (req,res)=>{
    req.flash('success','welcome back!');
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}