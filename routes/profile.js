import express from 'express';

const router = express.Router();

import authenticate from '../middleware/authentication.js';

import upload from '../utils/multer.js';
// =========================================================

// myApps
import {allProfiles, myApps, verifyProfile, adminverifyProfile, adminverifyProfilee, createProfile, currentProfile, adminverifyProfileAll, newApplication, pdfGen, adminGetApp, fullProfile, adminUnApprovedProfiles, adminRejectApp, adminApproveApp, allUsers} from '../controllers/profiles.js';

//GET ROUTES:-

//-----------------------USER ROUTES--------------------------

// Current User's Profile(Hidden:Current User)
router.get('/current',authenticate, currentProfile);

// Current User's Applications(Hidden:Current User)
router.get('/myapps',authenticate, myApps);

//-----------------------ADMIN ROUTES--------------------------

//All Users Route (Hidden:Admins)
router.get('/allusers',authenticate, allUsers);

//All Profiles Route (Hidden:Admins)
router.get('/allprofiles',authenticate, allProfiles);

// Check UnVerified Users Profiles For Verification (Hidden:collegeAdmin)
router.get('/adminverify',authenticate, adminverifyProfile);

// Check All Users Profiles For Verification(Hidden:collegeAdmin)
router.get('/adminverifyall',authenticate, adminverifyProfileAll);

// Check Only UnApproved Applications For Approval(Hidden:collegeAdmin) **
router.get('/adminunapproved',authenticate, adminUnApprovedProfiles);

// Check List Of All Users Applications For Approving Application(Hidden:collegeAdmin)
router.get('/admingetapp',authenticate, adminGetApp);


//POST ROUTES:-

//-----------------------USER ROUTES--------------------------

// Create or Update Current User's Profile(Hidden:Current User)
router.post('/create', authenticate,upload.single('collegeId'), createProfile);

//Apply to Verify Current User's Profile(Hidden:Current User)
router.post('/verify',authenticate, verifyProfile);

//New Application
router.post('/newapp',authenticate,upload.single('addressProof'), newApplication);

//-----------------------ADMIN ROUTES--------------------------

//  Verify User's Profile(Hidden:collegeAdmin)
router.post('/adminverify',authenticate, adminverifyProfilee);

//Approove New Application Of User(Hidden:All Admins)
router.post('/adminapprove',authenticate, adminApproveApp);

//Reject New Application Of User(Hidden:All Admins)
router.post('/adminrejectapp',authenticate, adminRejectApp);

//See full Profile of the User **
router.post('/fullprofile',authenticate, fullProfile);



//Download Concession Letter
router.post('/pdf',authenticate, pdfGen);


export default router;