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
        enum: ['user', 'admin'],  // Define enum for the role field
        default: 'user'           // Set default role to 'user'
    }
});
UserSchema.plugin(passportLocalMongoose);

module.exports= mongoose.model('User',UserSchema)