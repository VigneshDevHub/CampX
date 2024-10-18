const Campground = require('../models/campground');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require('../cloudinary');
const mongoose = require('mongoose');
const ExpressError = require('../utils/ExpressError.js');
const turf = require('@turf/turf');
const Review = require('../models/review');

/**
 * GET /campgrounds
 * Display all campgrounds, optionally sorted by price or review ratings.
 */
module.exports.index = async (req, res) => {
    const { sort } = req.query;
    let campgrounds;

    // Sort campgrounds based on the provided query parameter
    if (sort === 'priceAsc') {
        campgrounds = await Campground.find({}).populate('reviews').sort({ price: 1 }).lean();
    } else if (sort === 'priceDesc') {
        campgrounds = await Campground.find({}).populate('reviews').sort({ price: -1 }).lean();
    } else {
        campgrounds = await Campground.find({}).populate('reviews').lean();

        // Calculate average ratings for sorting
        const calculateAverageRating = (campground) => {
            const ratings = campground.reviews.map(review => review.rating);
            return ratings.length ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0;
        };

        if (sort === 'reviewsHighest') {
            campgrounds = campgrounds.map(campground => ({
                ...campground,
                averageRating: calculateAverageRating(campground)
            })).sort((a, b) => b.averageRating - a.averageRating);
        } else if (sort === 'reviewsLowest') {
            campgrounds = campgrounds.map(campground => ({
                ...campground,
                averageRating: calculateAverageRating(campground)
            })).sort((a, b) => a.averageRating - b.averageRating);
        }
    }

    res.render('campgrounds/index', { campgrounds, query: req.query });
};

/**
 * GET /campgrounds/search
 * Search for campgrounds by title.
 */
module.exports.searchCampgrounds = async (req, res) => {
    const { q } = req.query;
    const campgrounds = await Campground.find({ title: new RegExp(q, 'i') });
    res.render('campgrounds/index', { campgrounds });
};

/**
 * GET /campgrounds/new
 * Render the form for creating a new campground.
 */
module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
};

/**
 * POST /campgrounds
 * Create a new campground and save it to the database.
 */
module.exports.createCampground = async (req, res, next) => {
    try {
        // Geocode location to get coordinates
        const geoData = await geocoder.forwardGeocode({
            query: req.body.campground.location,
            limit: 1
        }).send();

        const campground = new Campground(req.body.campground);
        campground.geometry = geoData.body.features[0].geometry; // Set campground geometry from geocode data
        campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
        campground.author = req.user._id; // Associate campground with the logged-in user
        await campground.save();

        req.flash('success', 'Successfully made a new campground!');
        res.redirect(`/campgrounds/${campground._id}`);
    } catch (error) {
        const err = new ExpressError('Bad Gateway', 502);
        res.status(502).render('error', { err });
    }
};

/**
 * GET /campgrounds/:id
 * Display a specific campground by ID.
 */
module.exports.showCampground = async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        // Invalid object ID
        const err = new ExpressError('This URL is not supported', 400);
        return res.status(400).render('error', { err });
    }
    
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: { path: 'author' }
    }).populate('author');

    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    
    res.render('campgrounds/show', { campground });
};

/**
 * GET /campgrounds/nearest
 * Show nearest campgrounds based on user's location.
 */
module.exports.showNearestCampgrounds = async (req, res) => {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
        req.flash('error', 'Location not found');
        return res.redirect('/campgrounds');
    }

    const campgrounds = await Campground.find({});
    const userLocation = [parseFloat(lng), parseFloat(lat)];

    // Calculate the distance between user's location and each campground
    const sortedCampgrounds = campgrounds.map(campground => {
        const campgroundLocation = campground.geometry.coordinates;
        const distance = turf.distance(userLocation, campgroundLocation, { units: 'kilometers' });
        return { ...campground.toObject(), distance };
    }).sort((a, b) => a.distance - b.distance); // Sort by distance

    res.render('campgrounds/index', { campgrounds: sortedCampgrounds });
};

/**
 * GET /campgrounds/:id/edit
 * Render the form for editing a specific campground.
 */
module.exports.renderEditForm = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
};

/**
 * PUT /campgrounds/:id
 * Update a specific campground.
 */
module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();

    // Remove deleted images from cloudinary and database
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }

    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`);
};

/**
 * DELETE /campgrounds/:id
 * Delete a specific campground from the database.
 */
module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds');
};
