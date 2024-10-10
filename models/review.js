const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const reviewSchema = new Schema({
    body:String,
    rating: Number,
    description:{
        type:String,
        required:true
    },
    author:{
        type:Schema.Types.ObjectId,
        ref:'User'
    }
});

module.exports=mongoose.model("Review",reviewSchema);