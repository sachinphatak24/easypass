// import bcrypt from 'bcryptjs';
// import  jwt  from 'jsonwebtoken';

import Profile from '../models/profile.js';


export const verifyProfile = async(req,res) => {
    const {email,password,type} = req.body;

    try {
        const existingUser = await userModal.findOne({email});
        if(!existingUser) return res.json({status:404,message: "User Doesn't Exist!"});

        const isPasswordCorrect = await bcrypt.compare(password,existingUser.password);

        if(!isPasswordCorrect) return res.json({status:400,message: "Invalid Credentials!"});

        if(!(type === existingUser.type)) return res.json({status:400,message: "Error in type!"});

        // const token = jwt.sign({email: existingUser.email , id: existingUser._id, type:existingUser.type}, secret, {expiresIn:"3h"});

        res.json({status:200,message:'Successfully Verified User Profile',result: existingUser});

    } catch (error) {
        res.json({status:500, message:'Something Went Wrong.'});
    }
}

//allProfiles
export const allProfiles = async(req,res) => {
    try {
        const profiles = await Profile.find().populate('user',['name','type']);
        const userType = req.userInfo.type;
        if(userType === 'busAdmin' || userType==='collegeAdmin' || userType==='railwayAdmin'){
            return res.json({status:200,profiles});
        }else{
            res.json({erroMsg:'Need Admin Privilages To Access This Route.'});
        }
    } catch (error) {
        res.json({errorMsg:error});
    }
}

// Create or Update Profile
export const createProfile = async(req,res) => {
    try {    
        // Profile Object
        const {nameAsPerIdCard,dateOfBirth,collegeName,collegeId,branchName,currentYearOfStudy} = req.body;
        let profileFields = {};
        
        profileFields.user = req.userId;
        profileFields.userTypee = req.userInfo.type;
        if(nameAsPerIdCard) profileFields.nameAsPerIdCard = nameAsPerIdCard;
        if(dateOfBirth) profileFields.dateOfBirth = dateOfBirth;
        if (collegeName) profileFields.collegeName = collegeName;
        if(collegeId) profileFields.collegeId=collegeId;
        if(branchName) profileFields.branchName=branchName;
        if(currentYearOfStudy) profileFields.currentYearOfStudy=currentYearOfStudy;
        
        // profileFields.passinfo= {};
        // if (req.body.passtype) profileFields.passinfo.passtype = req.body.passtype;
        
        // Update
        Profile.findOne({user:req.userId}).then(profilee => {
        if(profilee){
            Profile.findOneAndUpdate(
                {user: req.userId},
                {$set: profileFields},
                {new: true}
                ).then(profilee =>res.json({status:200,profilee}));
            }else{
                // Create
            new Profile(profileFields).save().then(profilee => res.json({status:200,profilee}));
        }    
        });
    } catch (error) {
        res.json({status:'500', errorr:error});        
    }
} 

// Current Profile
export const currentProfile = async (req,res) => {
    try{
        const profile = await Profile.findOne({user:req.userId}).populate('user',['name','type']);
        if(!profile) return res.json({status:'400',message:'There is no profile for this user. Please Create one at `profile/create`'});
        res.json({status:200,profile});
    } catch(err){
        res.json({status:'500', error:'Server Error'});
    } 
}