import Profile from '../models/profile.js';

// Get Route for collegeAdmin to view Users Profiles for Verification
export const adminverifyProfile = async(req,res) => {
    try {
        const profiles = await Profile.find({profileVerifyApplied:true});
        const userType = req.userInfo.type;
        console.log(profiles.branchName);
        if(userType ==='collegeAdmin'){
            return res.json(profiles);
        }else{
            res.json({erroMsg:'Need Admin Privilages To Access This Route.'});
        }
    } catch (error) {
        res.json({errorMsg:error});
    }
}

// Post Route For Admin To Verify custom User's Profile
export const adminverifyProfilee = async(req,res) => {
    try {
        Profile.findOne({profileVerifyApplied:true,email:req.body.email}).then(profileToVerify => {
            if (profileToVerify) {
                Profile.findOneAndUpdate(
                    {profileVerifyApplied:true},
                    {$set:{profileVerifystatus:'Verified'}}
                    ).then(res.json({status:200, message:'Profile Verified'}));
                } else {
                    res.json({status:404,message:'There is no profile to be verified'});
                }
            }
            )
        } catch (error) {
            res.json({status:400, message:error});
    }
}


// Post Route For User To Submit Profile For Verification
export const verifyProfile = async(req,res) => {
    try {    
        Profile.findOne({user:req.userId,profileVerifyApplied:false}).then(profilee => {
        if(profilee){
            Profile.findOneAndUpdate(
                {user: req.userId},
                {$set: {profileVerifyApplied:true}}
                // {new: true}
                ).then(res.json({status:200,message:'Profile successfully sent for verification'}));
            }else{
                res.json({status:401, message:'Please Create a Profile before applying for verification or Please check if profile is already applied for verification'})       
        }    
        });
    } catch (error) {
        res.json({status:'500', errorr:error});        
    }
}


//Get Route for admins to view allProfiles
export const allProfiles = async(req,res) => {
    try {
        const profiles = await Profile.find().populate('user',['name','type']);
        const userType = req.userInfo.type;
        if(userType === 'busAdmin' || userType==='collegeAdmin' || userType==='railwayAdmin'){
            return res.json(profiles);
        }else{
            res.json({erroMsg:'Need Admin Privilages To Access This Route.'});
        }
    } catch (error) {
        res.json({errorMsg:error});
    }
}

// Post Route to Create or Update User's Profile
export const createProfile = async(req,res) => {
    try {    
        // Profile Object
        const {nameAsPerIdCard,dateOfBirth,collegeName,collegeId,branchName,currentYearOfStudy} = req.body;
        let profileFields = {};
        
        profileFields.user = req.userId;
        profileFields.userTypee = req.userInfo.type;
        profileFields.email = req.userInfo.email;
        if(nameAsPerIdCard) profileFields.nameAsPerIdCard = nameAsPerIdCard;
        if(dateOfBirth) profileFields.dateOfBirth = dateOfBirth;
        if (collegeName) profileFields.collegeName = collegeName;
        if(collegeId) profileFields.collegeId=collegeId;
        if(branchName) profileFields.branchName=branchName;
        if(currentYearOfStudy) profileFields.currentYearOfStudy=currentYearOfStudy;
        
        // Update
        Profile.findOne({user:req.userId}).then(profilee => {
        if(profilee){
            Profile.findOneAndUpdate(
                {user: req.userId},
                {$set: profileFields},
                {new: true}
                ).then(profilee =>res.json(profilee));
            }else{
                // Create
            new Profile(profileFields).save().then(profilee => res.json(profilee));
        }    
        });
    } catch (error) {
        res.json({status:'500', errorr:error});        
    }
} 

//Get Route to View Current User's Profile
export const currentProfile = async (req,res) => {
    try{
        const profile = await Profile.findOne({user:req.userId}).populate('user',['name','type']);
        if(!profile) return res.json({status:'400',message:'There is no profile for this user. Please Create one at `profile/create`'});
        res.json(profile);
    } catch(err){
        res.json({status:'500', error:'Server Error'});
    } 
}