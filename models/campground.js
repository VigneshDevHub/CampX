// Import necessary modules
const mongoose = require('mongoose');
const Review = require('./review'); // Model for associated reviews
const Schema = mongoose.Schema; // Extract Schema for easier usage

// Define the Image schema
const ImageSchema = new Schema({
  url: { type: String, required: true }, // Image URL is mandatory
  filename: { type: String, required: true } // Image filename is mandatory
});

// Virtual property to generate a thumbnail URL by resizing the image
ImageSchema.virtual('thumbnail').get(function () {
  return this.url.replace('/upload', '/upload/w_200');
});

// Define options to ensure virtuals are included in JSON output
const opts = { toJSON: { virtuals: true } };

// Define the Campground schema
const CampgroundSchema = new Schema(
  {
    title: { type: String, required: true }, // Campground title
    images: [ImageSchema], // Array of images using ImageSchema
    geometry: {
      type: {
        type: String,
        enum: ['Point'], // Enforces 'Point' type for GeoJSON structure
        required: true
      },
      coordinates: {
        type: [Number], // Array of numbers representing coordinates [longitude, latitude]
        required: true
      }
    },
    price: { type: Number, required: true }, // Campground price
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
  opts // Pass options to include virtuals in JSON responses
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
      await Review.deleteMany({
        _id: { $in: doc.reviews }
      });
    } catch (err) {
      console.error('Error deleting associated reviews:', err);
    }
  }
});

// Export the Campground model for use in other parts of the application
module.exports = mongoose.model('Campground', CampgroundSchema);
