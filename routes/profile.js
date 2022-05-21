import express from 'express';

const router = express.Router();

import authenticate from '../middleware/authentication.js';

import upload from '../utils/multer.js';

import crypto from 'crypto';
// ============================


// ============================


import Razorpay from 'razorpay'; 
// =========================================================

// myApps
import {allProfiles, myApps, verifyProfile, adminverifyProfile, adminverifyProfilee, createProfile, currentProfile, adminverifyProfileAll, newApplication, pdfGen, adminGetApp, fullProfile, adminUnApprovedProfiles, adminRejectApp, adminApproveApp, allUsers, busPases, railwayPases} from '../controllers/profiles.js';

// =================================
// order Route
router.post('/orders', async(req,res) =>{
    try {
        const instance=new Razorpay({
            key_id:'rzp_test_kehCvQHYpkIrTO',
            key_secret:'9hFynk38trO5l5iRya52zV4i'
        });
        const options = {
            amount: req.body.amount *100,
            currency:"INR",
            receipt:crypto.randomBytes(10).toString("hex")
        };
        instance.orders.create(options, (error,order) => {
            if(error) {
                console.log(error);
                return res.json({status:500, message: "Something Went Wrong!!"});
            }
            res.json({status:200, data:order});
        });
    } catch (error) {
        console.log(error);
        res.json({status:500,message:"Internal Server Error!"});
    }
});

router.post('/paymentVerify', async(req,res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature} = req.body;
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto.createHmac("sha256","9hFynk38trO5l5iRya52zV4i").update(sign.toString()).digest("hex");

        if (razorpay_signature === expectedSign) {
            return res.json({status:200,sign, message:"Payment Verified Successfully!"});
        } else {
            return res.json({status:400, message:"Invalid Signature Sent!"});
        }
    } catch (error) {
        
    }
})




// =================================
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

// ------------------RAILWAY ADMIN Route----------------------- 
router.get('/railwayPasses',authenticate,railwayPases);

// ---------------------BUS ADMIN Route------------------------ 
router.get('/busPasses',authenticate,busPases);


//Download Concession Letter
router.post('/pdf',authenticate, pdfGen);


export default router;