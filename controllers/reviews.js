const Campground=require('../models/campground');
const Review=require('../models/review');

module.exports.createReview = async(req,res)=>{
    const { rating, body } = req.body;
    const campground = await Campground.findById(req.params.id);
    const review = new Review({rating, body, user:req.user._id, campground:campground._id });
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success','Created a new review!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async(req,res)=>{
    const{id,reviewId}=req.params;
    await Campground.findByIdAndUpdate(id,{$pull:{reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','Successfully Deleted review!');
    res.redirect(`/campgrounds/${id}`);
}