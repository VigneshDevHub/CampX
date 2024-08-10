const mongoose = require('mongoose');
const cities=require('./cities');
const{places,descriptors}=require('./seedHelpers');
const Campground=require('../models/campground')

mongoose.connect('mongodb://127.0.0.1:27017/campx');

const db=mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open", ()=>{
    console.log("Database connected");
});

const sample=(array)=>array[Math.floor(Math.random()*array.length)];


const seedDB=async()=>{ 
    await Campground.deleteMany({});
    for(let i=0;i<300;i++)
    {
        const random1000=Math.floor(Math.random()*1000);
        const price= Math.floor(Math.random()*20)+10;
        const camp=new Campground({
            author:'66b1d30b0cbf0bfba9990116',
            location:`${cities[random1000].city},${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Amazing Place to hangout',
            price,
            geometry:{
              type:"Point",
              coordinates:[
                cities[random1000].longitude,
                cities[random1000].latitude
              ]
            },
            images:[
                {
                  url: 'https://res.cloudinary.com/dgr21eiov/image/upload/v1723104228/CampX/uz1w3sbimexznhvh9aqk.jpg',
                  filename: 'CampX/uz1w3sbimexznhvh9aqk',
                },
                {
                  url: 'https://res.cloudinary.com/dgr21eiov/image/upload/v1723104230/CampX/hqhssbovvo47cbz6b37g.jpg',
                  filename: 'CampX/hqhssbovvo47cbz6b37g',
                }
              ]
        })
        await camp.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close()
});