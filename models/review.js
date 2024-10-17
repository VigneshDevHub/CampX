const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    campground: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Campground",
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    body: {
        type: String,
        required: true,
        trim: true
    }
});

module.exports = mongoose.model('Review', reviewSchema);
