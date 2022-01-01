import express from 'express';
const router = express.Router();

import authenticate from '../middleware/authentication.js';

import { allProfiles , createProfile, currentProfile, verifyProfile} from '../controllers/profiles.js';


//All Profiles Route (Hidden:Admins)
router.get('/all',authenticate, allProfiles);

// Verify Current User's Profile(Hidden:Current User)
router.get('/verify',authenticate, verifyProfile);

// Create or Update Current User's Profile(Hidden:Current User)
router.post('/create', authenticate, createProfile);

// Current User's Profile(Hidden:Current User)
router.get('/current',authenticate, currentProfile);



export default router;



// // Current User's Pro    file(Hidden:Current User)
// router.get('/        current',authenticate ,function(req, res){
//                 res.json({status:'200',UserId:req.userInfo.id, UserEmail:req.userInfo.email, UserType:req.userInfo.type});
// });
