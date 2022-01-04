import express from 'express';

const router = express.Router();

import authenticate from '../middleware/authentication.js';

import multer from 'multer';

import cloudinary from '../utils/cloudinary.js'

import upload from '../utils/multer.js';


router.post('/upload', upload.single('image'), async (req,res) =>  {
    try {
        console.log("Hited af");
        const result = await cloudinary.uploader.upload(req.file.path)
        res.json(result);
    } catch (error) {
        console.log(error);
    }
});









// =========================================================

import {allProfiles, verifyProfile, adminverifyProfile, adminverifyProfilee, createProfile, currentProfile} from '../controllers/profiles.js';

//All Profiles Route (Hidden:Admins)
router.get('/all',authenticate, allProfiles);

//Apply to Verify Current User's Profile(Hidden:Current User)
router.post('/verify',authenticate, verifyProfile);

// Check Users Profiles For Verification(Hidden:collegeAdmin)
router.get('/adminverify',authenticate, adminverifyProfile);

// Confirm Verification of Users(Hidden:collegeAdmin)
router.post('/adminverify',authenticate, adminverifyProfilee);

// Create or Update Current User's Profile(Hidden:Current User)
router.post('/create', authenticate,upload.single('collegeId'), createProfile);

// Current User's Profile(Hidden:Current User)
router.get('/current',authenticate, currentProfile);



export default router;


// // Current User's Pro    file(Hidden:Current User)
// router.get('/        current',authenticate ,function(req, res){
//                 res.json({status:'200',UserId:req.userInfo.id, UserEmail:req.userInfo.email, UserType:req.userInfo.type});
// });
