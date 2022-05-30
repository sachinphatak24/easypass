import express from 'express';

const router = express.Router();

import authenticate from '../middleware/authentication.js';

import upload from '../utils/multer.js';

import crypto from 'crypto';
// ============================
import request from 'request';
// ============================
import Profile from '../models/profile.js';

import nodemailer from 'nodemailer';

import Razorpay from 'razorpay'; 

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'easypass24@gmail.com',
      pass: 'Easypass123'
    }
  });
// =========================================================

// myApps
import {allProfiles,railwayPassApprove, busPassApprove, passInfoCreate, myApps, verifyProfile, adminverifyProfile, adminverifyProfilee, createProfile, currentProfile, adminverifyProfileAll, newApplication, pdfGen, adminGetApp, fullProfile, adminUnApprovedProfiles, adminRejectApp, adminApproveApp, allUsers, busPases, railwayPases, proPic, adminRejectProfilee, deleteAccount} from '../controllers/profiles.js';

// =================================
// order Route
router.post('/orders',authenticate, async(req,res) =>{
    try {
        const instance=new Razorpay({
            key_id:'rzp_test_kehCvQHYpkIrTO',
            key_secret:'9hFynk38trO5l5iRya52zV4i'
        });
        const options = {
            amount: req.body.amount * 100,
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

router.post('/paymentVerify',authenticate, async(req,res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature} = req.body;
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto.createHmac("sha256","9hFynk38trO5l5iRya52zV4i").update(sign.toString()).digest("hex");
        if (razorpay_signature === expectedSign) {
            Profile.findOneAndUpdate(
                // {email:req.body.email,'applications.currentApplication.applicationStatus':"Under Process"},
                {user:req.userId},
                // {email:req.body.email},
                // {$set:{'applications.currentApplication.amountPaid':true,'applications.currentApplication.paymentId':razorpay_payment_id,'applications.allApplications.$.amountPaid':true,'applications.allApplications.$.paymentId':razorpay_payment_id,'applications.allApplications.$.paymentPaidOn':Date().toString(),'applications.currentApplication.paymentPaidOn':Date().toString()}},
                {$set:{'applications.currentApplication.amountPaid':true,'applications.currentApplication.paymentId':razorpay_payment_id,'applications.allApplications.0.amountPaid':true,'applications.allApplications.0.paymentId':razorpay_payment_id,'applications.allApplications.0.paymentPaidOn':Date().toString(),'applications.currentApplication.paymentPaidOn':Date().toString()}},
                // {$set:{'applications.allApplications.$.applicationStatus':"calm"}},
                {new: true}
                ).then( async() => {   
                    const response = await Profile.findOne({user:req.userId}).populate('user');
                    var mailOptions = {
                        from: 'easypass24@gmail.com',
                        to: response.email,
                        subject: 'Payment Succesfull!',
                        text: `
                Hi ${response.nameAsPerIdCard.charAt(0).toUpperCase()+ response.nameAsPerIdCard.slice(1)},
                        
                    Your Payment Of Rs.${response.applications.currentApplication.amount} Was Succssful For Your Travel Pass.
                
                
                Thank You!
                EasyPass`
    
                        };
                        transporter.sendMail(mailOptions, function(error, info){
                            if (error) {
                                console.log(error);
                            } else {
                                console.log('Email sent: ' + info.response);
                            }
                        });   
    
                    return res.json({status:200,response,message:"Payment Verified Successfully!"});
                }
                    )
        } else {
            return res.json({status:400, message:"Invalid Signature Sent!"});
        }
    } catch (error) {
        
    }
})

router.post("/payments",authenticate, async (req, res) => {
    try {
        // const profile = await Profile.findOne({email:req.userInfo.email});
        // console.log(profile);
        // console.log(profile.applications.currentApplication.paymentId);
        // const paymentID = profile.applications.currentApplication.paymentId;
        const paymentId = req.body.paymentId;
        request(
            `https://${'rzp_test_kehCvQHYpkIrTO'}:${'9hFynk38trO5l5iRya52zV4i'}@api.razorpay.com/v1/payments/${paymentId}`,
            function (error, response, body) {
                if (body) {
                    const result = JSON.parse(body);
                    res.json({status:200,result});
                }else{
                    res.json({status:400,message:"No payment history."});

                }
            }
            );
            
        } catch (error) {
            res.json({status:500, message: error});
        }
});
        

router.post('/profilepic', authenticate, upload.single('profilePic'), proPic);
router.post('/deleteaccount', authenticate, deleteAccount);
router.post('/passinfo',authenticate, passInfoCreate);

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

//  Verify User's Profile(Hidden:collegeAdmin)
router.post('/adminrejectprofile',authenticate, adminRejectProfilee);

//Approove New Application Of User(Hidden:All Admins)
router.post('/adminapprove',authenticate, adminApproveApp);

//Reject New Application Of User(Hidden:All Admins)
router.post('/adminrejectapp',authenticate, adminRejectApp);

//See full Profile of the User **
router.post('/fullprofile',authenticate, fullProfile);

// ------------------RAILWAY ADMIN Route----------------------- 
router.get('/railwayPasses',authenticate,railwayPases);

router.post('/railwaypassapprove',authenticate,railwayPassApprove);

// ---------------------BUS ADMIN Route------------------------ 
router.get('/busPasses',authenticate,busPases);
router.get('/busPassaprove',authenticate,busPassApprove);


//Download Concession Letter
router.post('/pdf',authenticate, pdfGen);


export default router;