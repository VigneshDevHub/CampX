const Campground=require('../models/campground');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken=process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken:mapBoxToken});
const {cloudinary} = require('../cloudinary');
const { query } = require('express');
const turf = require('@turf/turf');
const Review = require('../models/review');

module.exports.index = async (req, res) => {
    const { sort } = req.query;
    // console.log("Sort Query Parameter: ", sort);  
    let campgrounds;
    if (sort === 'priceAsc') {
    
        campgrounds = await Campground.find({}).populate('reviews').sort({ price: 1 }).lean();
    } else if (sort === 'priceDesc') {
        
        campgrounds = await Campground.find({}).populate('reviews').sort({ price: -1 }).lean();
    } else {
        
        campgrounds = await Campground.find({}).populate('reviews').lean();

        if (sort === 'reviewsHighest') {
          
            campgrounds = campgrounds.map(campground => {
                const ratings = campground.reviews.map(review => review.rating);
                const averageRating = ratings.length
                    ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
                    : 0;
                return { ...campground, averageRating };
            }).sort((a, b) => b.averageRating - a.averageRating); 
        } else if (sort === 'reviewsLowest') {
          
            campgrounds = campgrounds.map(campground => {
                const ratings = campground.reviews.map(review => review.rating);
                const averageRating = ratings.length
                    ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
                    : 0;
                return { ...campground, averageRating };
            }).sort((a, b) => a.averageRating - b.averageRating); 
        }
    }

    res.render('campgrounds/index', { campgrounds, query: req.query });
};
module.exports.searchCampgrounds = async (req, res) => {
    const { q } = req.query;
    const campgrounds = await Campground.find({ title: new RegExp(q, 'i') });
    res.render('campgrounds/index', { campgrounds });
};
module.exports.renderNewForm = (req,res)=>{
    res.render('campgrounds/new');
}

module.exports.createCampground = async(req,res,next)=>{
    const geoData=await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit:1
    }).send()
    const campground=new Campground(req.body.campground);
    campground.geometry=geoData.body.features[0].geometry;
    campground.images = req.files.map(f=>({url:f.path,filename: f.filename}));
    campground.author =req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success','Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground = async(req,res)=>{
    const campground=await Campground.findById(req.params.id).populate({
        path:'reviews',
        populate:{
            path:'author'
        }
    }).populate('author');
    if(!campground){
        req.flash('error','Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show',{campground});
}

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

module.exports.renderEditForm = async(req,res)=>{
    const campground=await Campground.findById(req.params.id);
    if(!campground){
        req.flash('error','Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit',{campground});
}

module.exports.updateCampground = async(req,res)=>{
    const{id}=req.params;
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground});
    const imgs=req.files.map(f=>({url:f.path,filename: f.filename}))
    campground.images.push(...imgs);
    await campground.save()
    if (req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull:{images:{filename:{$in:req.body.deleteImages}}}})
    }
    req.flash('success','Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground = async(req,res)=>{
    const{id}=req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success','Successfully Deleted campground!');
    res.redirect('/campgrounds');
}