// Import necessary modules
const express = require('express');
const router = express.Router();
const Campground = require(''./review'');

// Route to handle new campground creation
router.post('/campgrounds', async (req, res, next) => {
  try {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  } catch (err) {
    // Check if the error is a validation error
    if (err.name === 'ValidationError') {
      // Render the form again with an error message
      req.flash('error', 'Title must be at least 3 characters.');
      return res.redirect('/campgrounds/new');
    }
    next(err); // Pass any other errors to the default error handler
  }
});

module.exports = router;

// Define the Image schema
const ImageSchema = new Schema({
  url: { type: String, required: true }, // Image URL is mandatory
  filename: { type: String, required: true } // Image filename is mandatory
});

// Virtual property to generate a thumbnail URL by resizing the image
ImageSchema.virtual('thumbnail').get(function () {
  return this.url.replace('/upload', '/upload/w_200');
});

// Define options to ensure virtuals are included in JSON output and add timestamps
const opts = { toJSON: { virtuals: true }, timestamps: true };

// Define the Campground schema
const CampgroundSchema = new Schema(
  {
    title: { type: String, required: true, minlength: 3 }, // Minimum title length of 3 characters
    images: [ImageSchema], // Array of images using ImageSchema
    geometry: {
      type: {
        type: String,
        enum: ['Point'], // Enforces 'Point' type for GeoJSON structure
        required: true
      },
      coordinates: {
        type: [Number], // Array of numbers representing coordinates [longitude, latitude]
        required: true,
        validate: {
          validator: (coords) => coords.length === 2,
          message: "Coordinates must contain longitude and latitude"
        }
      }
    },
    price: { type: Number, required: true, min: 0 }, // Price must be positive
    description: { type: String, required: true }, // Description of the campground
    location: { type: String, required: true }, // Location of the campground
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model
      required: true
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Review' // Reference to Review model
      }
    ]
  },
  opts // Pass options to include virtuals in JSON responses and add timestamps
);

// Virtual property to generate a small popup HTML snippet for use in maps or previews
CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
  return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0, 20)}...</p>`;
});

// Middleware to delete associated reviews when a campground is deleted
CampgroundSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    try {
      const result = await Review.deleteMany({
        _id: { $in: doc.reviews }
      });
      console.log(`Successfully deleted ${result.deletedCount} associated reviews for campground ${doc._id}`);
    } catch (err) {
      console.error(`Error deleting associated reviews for campground ${doc._id}:`, err);
    }
  }
});

// Export the Campground model for use in other parts of the application
module.exports = mongoose.model('Campground', CampgroundSchema);
