if(process.env.NODE_ENV !== "production"){
  require('dotenv').config();
}

const mongoose = require('mongoose');
const cities=require('./cities');
const{places,descriptors}=require('./seedHelpers');
const Campground=require('../models/campground')
const dbUrl=process.env.DB_URL || 'mongodb://127.0.0.1:27017/campx';

mongoose.connect(dbUrl);

const db=mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open", ()=>{
    console.log("Database connected");
});


const seedDB=async()=>{ 
    await Campground.deleteMany({});
    for(let i=0;i<20;i++)
    {
        const camp=new Campground({
            author:'66b75813e36010f731649d27',
            location:`${cities[i].city},${cities[i].state}`,
            title: `${cities[i].title}`,
            description: `${cities[i].description}`,
            price: `${cities[i].price}`,
            geometry:{
              type:"Point",
              coordinates:[
                cities[i].longitude,
                cities[i].latitude
              ]
            },
            images:[
                {
                  url: `${cities[i].images[0].url}`,
                  filename: `${cities[i].images[0].filename}`,
                },
                {
                  url: `${cities[i].images[1].url}`,
                  filename: `${cities[i].images[1].filename}`,
                }
              ]
        })
        await camp.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close()
});