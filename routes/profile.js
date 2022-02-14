import express from 'express';

const router = express.Router();

import authenticate from '../middleware/authentication.js';

import upload from '../utils/multer.js';
// =========================================================

import {allProfiles, verifyProfile, adminverifyProfile, adminverifyProfilee, createProfile, currentProfile, adminverifyProfileAll, newApplication, pdfGen, adminGetApp, fullProfile, adminUnApprovedProfiles, myApps, adminRejectApp, adminApproveApp} from '../controllers/profiles.js';

//GET ROUTES:-

//All Profiles Route (Hidden:Admins)
router.get('/all',authenticate, allProfiles);

// Check Users Profiles For Verification(Hidden:collegeAdmin)
router.get('/adminverify',authenticate, adminverifyProfile);

// Check List Of Users Profiles For Verification(Hidden:collegeAdmin)
router.get('/adminverifyall',authenticate, adminverifyProfileAll);

// Check UnApproved Profiles For Approval(Hidden:collegeAdmin) **
router.get('/adminunapproved',authenticate, adminUnApprovedProfiles);

// Check List Of Users Profiles For Verification(Hidden:collegeAdmin)
router.get('/admingetapp',authenticate, adminGetApp);

// Current User's Profile(Hidden:Current User)
router.get('/current',authenticate, currentProfile);

// Current User's Applications(Hidden:Current User)
router.get('/myapps',authenticate, myApps);

//POST ROUTES:-

//Apply to Verify Current User's Profile(Hidden:Current User)
router.post('/verify',authenticate, verifyProfile);

//New Application
router.post('/newapp',authenticate,upload.single('addressProof'), newApplication);

//Approove new application of user(Hidden:All Admins)
router.post('/adminapprove',authenticate, adminApproveApp);

// router.post('/adminverifyapp',authenticate, adminverifyapp);

//Approove new application of user(Hidden:All Admins)
router.post('/adminrejectapp',authenticate, adminRejectApp);

//See full Profile of the User **
router.post('/fullprofile',authenticate, fullProfile);

// Confirm Verification of Users(Hidden:collegeAdmin)
router.post('/adminverify',authenticate, adminverifyProfilee);

// Confirm Verification of Users(Hidden:collegeAdmin)
router.post('/adminverify',authenticate, adminverifyProfilee);

// Create or Update Current User's Profile(Hidden:Current User)
router.post('/create', authenticate,upload.single('collegeId'), createProfile);


//Download Concession Letter
router.post('/pdf',authenticate, pdfGen);


export default router;