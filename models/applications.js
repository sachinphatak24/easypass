import  mongoose from 'mongoose';

import User from './user.js';

import profile from './profile.js';

const applicationSchema = mongoose.Schema({
    profile:{type:mongoose.Schema.Types.ObjectId, ref:'Profile'},
    email:{type:String},
    applications:[
        {
            travelOption:{type:String},
            startLocation:{type:String},
            endLocation:{type:String},
            travelPassPeriod:{type:String},
            applicationStatus:{type:String},
            appliedOn:{type:String},
            addressProof:{type:String},
            applicationAcceptedOn:{type:String}
        } 
    ]
})

export default mongoose.model('applications', applicationSchema);
