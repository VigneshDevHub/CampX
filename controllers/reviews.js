const Campground=require('../models/campground');
const Review=require('../models/review');

module.exports.createReview = async(req,res)=>{
    const campground = await Campground.findById(req.params.id);

    const isReviewExist = campground.reviews.find(review => review.author._id.equals(req.user._id));
    if(isReviewExist){
        req.flash("error", "You already add a review for this ground!")
        return res.redirect(`/campgrounds/${campground._id}`);
    }
    const review= new Review(req.body.review);
    review.author=req.user._id;
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