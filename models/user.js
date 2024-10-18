const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const passportLocalMongoose=require('passport-local-mongoose');

const UserSchema= new Schema({
    firstName: {
            type: String,
            required: true,
            trim: true
        },
    lastName: {
            type: String,
            required: true,
            trim: true
        },
    email:{
        type: String,
        required:true
    },
    password: {
            type: String,
            required: true,
            trim: true
        },
    confirmPassowrd: {
            type: String,
            // required: true,
            default: undefined
        },
    role:{
        type:String,
        enum: ['Admin', 'Student', 'Instructor'],
        default: 'Student'
    }
});
UserSchema.plugin(passportLocalMongoose);

module.exports= mongoose.model('User',UserSchema)