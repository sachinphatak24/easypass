import  mongoose from 'mongoose';

import User from './user.js';
const profileSchema = mongoose.Schema({
    user:{type: mongoose.Schema.Types.ObjectId,ref:'User'},
    email:{type:String,ref:'User',required:true},
    nameAsPerIdCard:{type:String,required:true},
    dateOfBirth:{type:String,required:true},
    collegeId:{type: String,required: true},
    cloudinaryId:{type: String},
    collegeName: {type: String, required: true}, 
    currentYearOfStudy: {type: String, required: true}, 
    branchName:{type:String,required:true},
    location:{type:String},
    date:{type:String, default: Date().toString()},
    profileVerifyApplied:{ type: Boolean, default: false },
    profileVerifystatus:{type:String,default:"UnVerified"},
    profileVerifyDate:{type:String,default:''},
    applications:{
        currentApplication:{
            applicationAcceptedOn:{type:String,default:" "},
            applicationStatus:{type:String,default:"Under Process"},
            appliedOn:{type:String,default:Date().toString()},
            travelOption:{type:String},
            startLocation:{type:String},
            endLocation:{type:String},
            travelPassPeriod:{type:String},
            addressProof:{type:String}
        },
        allApplications:[
        {
            travelOption:{type:String},
            startLocation:{type:String},
            endLocation:{type:String},
            travelPassPeriod:{type:String},
            applicationStatus:{type:String,default:"Under Process"},
            appliedOn:{type:String,default:Date().toString()},
            addressProof:{type:String},
            applicationAcceptedOn:{type:String,default:" "}
        }],
    },
        passinfo:[{
        passType:{type:String,default:''},
        passVerifyStatus:{type:String,default:'UnVerified'},
        passApproveStatus:{type:String,default:'UnApproved'},
    }]
});

export default mongoose.model('Profile', profileSchema);
