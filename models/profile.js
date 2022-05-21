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
    profileVerifystatus:{type:String, default:"UnVerified"},
    profileVerifyDate:{type:String},
    applications:{
        currentApplication:{
            name:{type:String},
            email:{type:String},

            applicationAcceptedOn:{type:String},
            applicationRejectedOn:{type:String},
            applicationStatus:{type:String},
            appliedOn:{type:String},
            travelOption:{type:String},
            startLocation:{type:String},
            endLocation:{type:String},
            travelPassPeriod:{type:String},
            addressProof:{type:String},
            
            amount:{type:String},
            amountPaid:{type:Boolean, default:false},
            paymentId:{type:String},
            paymentPaidOn:{type:String}

        },
        allApplications:[
        {
            name:{type:String},
            email:{type:String},

            travelOption:{type:String},
            startLocation:{type:String},
            endLocation:{type:String},
            travelPassPeriod:{type:String},
            applicationStatus:{type:String},
            appliedOn:{type:String},
            addressProof:{type:String},
            applicationRejectedOn:{type:String},
            applicationAcceptedOn:{type:String},
            
            amount:{type:String},
            amountPaid:{type:Boolean, default:false},
            paymentId:{type:String},
            paymentPaidOn:{type:String}
        }],
    },
        passinfo:[{
        passType:{type:String},
        passVerifyStatus:{type:String,default:'UnVerified'},
        passApproveStatus:{type:String,default:'UnApproved'},
    }]
});

export default mongoose.model('Profile', profileSchema);