const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const passportLocalMongoose=require('passport-local-mongoose');

const UserSchema= new Schema({
    email:{
        type: String,
        required:true
    },
    role:{
        type:String,
        enum:['ROLE_USER','ROLE_ADMIN'],// Define enum for the role field
        default:"ROLE_USER",// Set default role to 'ROLE_USER'
    }
});
UserSchema.plugin(passportLocalMongoose);

module.exports= mongoose.model('User',UserSchema)