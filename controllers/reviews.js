// Import necessary models
const Campground = require('../models/campground');
const Review = require('../models/review');

/**
 * Creates a new review for a specific campground.
 *  - Finds the campground by ID with explicitly populate the author field.
 *  - Checking that if one user try to submit more than one review then flash a error message and return. If not then proceed further. 
 *  - Creates a new review with the submitted data and assigns the current user as the author.
 *  - Saves the review and updates the campground's review list.
 *  - Redirects to the campground's page with a success message.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
module.exports.createReview = async (req, res) => {
    try {
        // Explicietly populate each review author field to prevent multiple review from one user
        const campground = await Campground.findById(req.params.id).populate({
            path: "reviews",
            populate: { path: "author" }
        });

        // Checking for preventing review spam by one user
        const isReviewExist = campground.reviews.some(review => review.author && review.author._id.equals(req.user._id));
        if(isReviewExist){
            req.flash("error", "You already submit a review for this camp ground!");
            return res.redirect(`/campgrounds/${campground._id}`);
        }

        // Prevent form submission if review body is gretter than 1000 charecter
        if(req.body.review.body.length >= 1000){
            req.flash("error", "Review must be within 1000 character!");
            return res.redirect(`/campgrounds/${campground._id}`);
        }

        // Create a new review using the data from the request body
        const review = new Review(req.body.review);
        review.author = req.user._id; // Set the review's author to the current user

        // Add the new review to the campground's reviews array
        campground.reviews.push(review);

        // Save both the review and the updated campground
        await review.save();
        await campground.save();

        req.flash('success', 'Created a new review!');
        res.redirect(`/campgrounds/${campground._id}`);
    } catch (error) {
        console.error('Error creating review:', error);
        req.flash('error', 'Failed to create the review. Please try again.');
        res.redirect('/campgrounds');
    }
};

/**
 * Deletes a specific review from a campground.
 *  - Removes the review reference from the campground's reviews array.
 *  - Deletes the review from the database.
 *  - Redirects to the campground's page with a success message.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
module.exports.deleteReview = async (req, res) => {
    try {
        const { id, reviewId } = req.params;

        // Remove the review reference from the campground's reviews array
        await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

        // Delete the review from the database
        await Review.findByIdAndDelete(reviewId);

        req.flash('success', 'Successfully deleted the review!');
        res.redirect(`/campgrounds/${id}`);
    } catch (error) {
        console.error('Error deleting review:', error);
        req.flash('error', 'Failed to delete the review. Please try again.');
        res.redirect(`/campgrounds/${id}`);
    }
};
