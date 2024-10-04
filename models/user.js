const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const passportLocalMongoose=require('passport-local-mongoose');

const UserSchema= new Schema({
    email:{
        type: String,
        required:true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],  
        default: 'user'           
    }
});
UserSchema.plugin(passportLocalMongoose);

module.exports= mongoose.model('User',UserSchema)