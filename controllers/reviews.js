const Campground=require('../models/campground');
const Review=require('../models/review');
const catchAsync = require('../utils/catchAsync.js')

module.exports.createReview = catchAsync(async(req,res,next)=>{
    const campground = await Campground.findById(req.params.id);
    const review= new Review(req.body.review);
    review.author=req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success','Created a new review!');
    res.redirect(`/campgrounds/${campground._id}`);
})

module.exports.deleteReview = catchAsync(async(req,res,next)=>{
    const{id,reviewId}=req.params;
    await Campground.findByIdAndUpdate(id,{$pull:{reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','Successfully Deleted review!');
    res.redirect(`/campgrounds/${id}`);
})