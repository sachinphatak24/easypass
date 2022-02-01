import express from 'express';

const router = express.Router();

import authenticate from '../middleware/authentication.js';

import multer from 'multer';

import cloudinary from '../utils/cloudinary.js'

import upload from '../utils/multer.js';



router.get('/pdf',authenticate, pdfGen);









// =========================================================

import {allProfiles, verifyProfile, adminverifyProfile, adminverifyProfilee, createProfile, currentProfile, adminverifyProfileAll, newApplication, adminverifyapp, pdfGen} from '../controllers/profiles.js';

//All Profiles Route (Hidden:Admins)
router.get('/all',authenticate, allProfiles);

//Apply to Verify Current User's Profile(Hidden:Current User)
router.post('/verify',authenticate, verifyProfile);

//New Application
router.post('/newapp',authenticate,upload.single('addressProof'), newApplication);

//Approove new application of user(Hidden:All Admins)
router.post('/adminverifyapp',authenticate, adminverifyapp);

// Check Users Profiles For Verification(Hidden:collegeAdmin)
router.get('/adminverify',authenticate, adminverifyProfile);

// Check List Of Users Profiles For Verification(Hidden:collegeAdmin)
router.get('/adminverifyall',authenticate, adminverifyProfileAll);

// Confirm Verification of Users(Hidden:collegeAdmin)
router.post('/adminverify',authenticate, adminverifyProfilee);

// Create or Update Current User's Profile(Hidden:Current User)
router.post('/create', authenticate,upload.single('collegeId'), createProfile);

// Current User's Profile(Hidden:Current User)
router.get('/current',authenticate, currentProfile);



export default router;