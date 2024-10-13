const {campgroundSchema, reviewSchema}= require('./schemas.js');
const ExpressError=require('./utils/ExpressError');
const {userRole , adminRole} = require('./utils/constant');
const Campground=require('./models/campground');
const Review=require('./models/review');

module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash('error','You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

module.exports.validateCampground=(req,res,next)=>{
    const {error}= campgroundSchema.validate(req.body);
    if(error)
    {
        const msg=error.details.map(el=> el.message).join(',');
        throw new ExpressError(msg,400);
    }
    else
    {
        next();
    }
}

module.exports.isAuthor = async(req,res,next)=>{
    const {id}=req.params;
    const campground =await Campground.findById(id);
    if(campground.author.equals(req.user.id)||req.user.role===adminRole){
        next(); 
    }else
    {
        const err = new ExpressError('You do not have permission to do that', 403)
        res.status(403).render('error',{err})
    }
    
}

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

module.exports.validateReview = (req,res,next)=>{
    const {error} = reviewSchema.validate(req.body);
    if(error)
    {
        const msg=error.details.map(el=> el.message).join(',');
        throw new ExpressError(msg,400);
    }
    else
    {
        next();
    }
}

module.exports.isReviewAuthor = async(req,res,next)=>{
    const {id,reviewId}=req.params;
    const review =await Review.findById(reviewId);
    if(review.author.equals(req.user.id)||req.user.role===adminRole){
        next();
    }else
    {
        req.flash('error','You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    
}