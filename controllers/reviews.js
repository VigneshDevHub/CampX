// Import necessary models
const Campground = require('../models/campground');
const Review = require('../models/review');
// Get the reviews container element by its ID
const reviewsContainer = document.getElementById('reviews-container');

// Create a wrapper div for scrollable reviews and style it
const scrollableContainer = document.createElement('div');
scrollableContainer.style.maxHeight = '400px'; // Set the max height for the container
scrollableContainer.style.overflowY = 'auto';   // Enable vertical scrolling
scrollableContainer.style.border = '1px solid #ccc'; 
scrollableContainer.style.padding = '10px';     

// Move the existing reviews into this new scrollable container
while (reviewsContainer.firstChild) {
    scrollableContainer.appendChild(reviewsContainer.firstChild);
}

// Append the scrollable container to the reviews container
reviewsContainer.appendChild(scrollableContainer);

// Additional Consideration: Limit the number of reviews displayed initially and load more on demand
const reviews = Array.from(scrollableContainer.children);
const initialDisplayCount = 5; // Number of reviews to display initially
let currentDisplayCount = initialDisplayCount;

// Hide reviews beyond the initial display count
for (let i = initialDisplayCount; i < reviews.length; i++) {
    reviews[i].style.display = 'none';
}

// Create a "Load More" button
const loadMoreButton = document.createElement('button');
loadMoreButton.textContent = 'Load More';
loadMoreButton.style.display = 'block';
loadMoreButton.style.margin = '10px auto';
loadMoreButton.style.padding = '10px 20px';
loadMoreButton.style.border = 'none';
loadMoreButton.style.backgroundColor = '#007bff';
loadMoreButton.style.color = '#fff';
loadMoreButton.style.cursor = 'pointer';

// Add an event listener to the "Load More" button
loadMoreButton.addEventListener('click', () => {
    const nextDisplayCount = currentDisplayCount + initialDisplayCount;
    for (let i = currentDisplayCount; i < nextDisplayCount && i < reviews.length; i++) {
        reviews[i].style.display = 'block';
    }
    currentDisplayCount = nextDisplayCount;

    // Hide the "Load More" button if all reviews are displayed
    if (currentDisplayCount >= reviews.length) {
        loadMoreButton.style.display = 'none';
    }
});

// Append the "Load More" button to the reviews container if there are more reviews to load
if (reviews.length > initialDisplayCount) {
    reviewsContainer.appendChild(loadMoreButton);
}

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
