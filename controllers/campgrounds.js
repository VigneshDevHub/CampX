// Import required modules
const Campground = require('../models/campground');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require('../cloudinary');
const mongoose = require('mongoose');
const ExpressError = require('../utils/ExpressError.js');
const turf = require('@turf/turf');
const Review = require('../models/review');

// Controller for Campground functionalities
module.exports = {
    /**
     * Display a list of campgrounds with optional sorting.
     * Sort options include:
     * - priceAsc: Sort by price in ascending order
     * - priceDesc: Sort by price in descending order
     * - reviewsHighest: Sort by average review ratings in descending order
     * - reviewsLowest: Sort by average review ratings in ascending order
     */
    index: async (req, res) => {
        const { sort } = req.query;  
        let campgrounds;

        // Fetch campgrounds with optional sorting
        if (sort === 'priceAsc') {
            campgrounds = await Campground.find({}).populate('reviews').sort({ price: 1 }).lean();
        } else if (sort === 'priceDesc') {
            campgrounds = await Campground.find({}).populate('reviews').sort({ price: -1 }).lean();
        } else {
            campgrounds = await Campground.find({}).populate('reviews').lean();

            // Calculate average ratings for sorting by reviews
            const calculateAverageRating = (campground) => {
                const ratings = campground.reviews.map(review => review.rating);
                const averageRating = ratings.length
                    ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
                    : 0;
                return { ...campground, averageRating };
            };

            // Sort by average rating
            if (sort === 'reviewsHighest') {
                campgrounds = campgrounds.map(calculateAverageRating)
                    .sort((a, b) => b.averageRating - a.averageRating);
            } else if (sort === 'reviewsLowest') {
                campgrounds = campgrounds.map(calculateAverageRating)
                    .sort((a, b) => a.averageRating - b.averageRating);
            }
        }

        res.render('campgrounds/index', { campgrounds, query: req.query });
    },

    /**
     * Search for campgrounds based on the query parameter.
     * The search is case-insensitive and matches against campground titles.
     */
    searchCampgrounds: async (req, res) => {
        const { q } = req.query;
        const campgrounds = await Campground.find({ title: new RegExp(q, 'i') });
        res.render('campgrounds/index', { campgrounds });
    },

    /**
     * Render the form for creating a new campground.
     */
    renderNewForm: (req, res) => {
        res.render('campgrounds/new');
    },

    /**
     * Create a new campground with geocoding and image upload.
     * The campground's location is resolved into geographical coordinates.
     */
    createCampground: async (req, res, next) => {
        try {
            // Geocode the campground location
            const geoData = await geocoder.forwardGeocode({
                query: req.body.campground.location,
                limit: 1
            }).send();

            const campground = new Campground(req.body.campground);
            campground.geometry = geoData.body.features[0].geometry;
            campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
            campground.author = req.user._id;

            await campground.save();
            req.flash('success', 'Successfully made a new campground!');
            res.redirect(`/campgrounds/${campground._id}`);
        } catch (error) {
            const err = new ExpressError('Bad Gateway', 502);
            res.status(502).render('error', { err });
        }
    },

    /**
     * Display a specific campground by its ID.
     * Returns an error if the campground is not found or if the ID is invalid.
     */
    showCampground: async (req, res) => {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            const err = new ExpressError('This URL is not supported', 400);
            return res.status(400).render('error', { err });
        }

        const campground = await Campground.findById(req.params.id)
            .populate({
                path: 'reviews',
                populate: {
                    path: 'author'
                }
            })
            .populate('author');

        if (!campground) {
            req.flash('error', 'Cannot find that campground!');
            return res.redirect('/campgrounds');
        }
        res.render('campgrounds/show', { campground });
    },

    /**
     * Show nearest campgrounds based on user's geographical location.
     * Requires latitude and longitude to calculate distances.
     */
    showNearestCampgrounds: async (req, res) => {
        const { lat, lng } = req.query;
        if (!lat || !lng) {
            req.flash('error', 'Location not found');
            return res.redirect('/campgrounds');
        }

        const campgrounds = await Campground.find({});
        const userLocation = [parseFloat(lng), parseFloat(lat)];

        // Calculate distance to each campground and sort by distance
        const sortedCampgrounds = campgrounds.map(campground => {
            const campgroundLocation = campground.geometry.coordinates;
            const distance = turf.distance(userLocation, campgroundLocation, { units: 'kilometers' });
            return { ...campground.toObject(), distance };
        }).sort((a, b) => a.distance - b.distance);

        res.render('campgrounds/index', { campgrounds: sortedCampgrounds });
    },

    /**
     * Render the form for editing an existing campground.
     * Returns an error if the campground is not found.
     */
    renderEditForm: async (req, res) => {
        const campground = await Campground.findById(req.params.id);
        if (!campground) {
            req.flash('error', 'Cannot find that campground!');
            return res.redirect('/campgrounds');
        }
        res.render('campgrounds/edit', { campground });
    },

    /**
     * Update an existing campground's details, including geocoding and image handling.
     * Deletes specified images if requested.
     */
    updateCampground: async (req, res) => {
        const { id } = req.params;

        // Geocode the new location for the campground
        const geoData = await geocoder.forwardGeocode({
            query: req.body.campground.location,
            limit: 1
        }).send();

        const geometry = geoData.body.features[0].geometry;

        const campground = await Campground.findByIdAndUpdate(id, {
            ...req.body.campground,
            geometry: geometry // Update the geometry field with new data
        }, { new: true });

        const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
        campground.images.push(...imgs); // Add new images
        await campground.save();

        // Delete specified images from Cloudinary and the database
        if (req.body.deleteImages) {
            for (let filename of req.body.deleteImages) {
                await cloudinary.uploader.destroy(filename);
            }
            await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
        }

        req.flash('success', 'Successfully updated campground!');
        res.redirect(`/campgrounds/${campground._id}`);
    },

    /**
     * Delete a campground by its ID.
     */
    deleteCampground: async (req, res) => {
        const { id } = req.params;
        await Campground.findByIdAndDelete(id);
        req.flash('success', 'Successfully deleted campground!');
        res.redirect('/campgrounds');
    }
};
