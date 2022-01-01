import  mongoose from 'mongoose';

import User from './user.js';
const profileSchema = mongoose.Schema({
    user:{type: mongoose.Schema.Types.ObjectId,ref:'User'},
    // usertype:{type:String, default:'Student'},
    nameAsPerIdCard:{type:String,required:true},
    dateOfBirth:{type:String,required:true},
    collegeId:{type: String, required:true},
    collegeName: {type: String, required: true}, 
    currentYearOfStudy: {type: String, required: true}, 
    branchName:{type:String,required:true},
    location:{type:String},
    date:{type:Date, default: Date.now},
    passinfo:[{
        passType:{type:String,default:''},
        passVerifyStatus:{type:String,default:'UnVerified'},
        passApproveStatus:{type:String,default:'UnApproved'},
    }]
});

export default mongoose.model('Profile', profileSchema);
