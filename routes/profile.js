import express from 'express';
// import multer from 'multer';
// import  GridFsStorage from 'multer-gridfs-storage';
// import crypto from 'crypto';
// import path from 'path';

const router = express.Router();

import authenticate from '../middleware/authentication.js';

import { allProfiles , createProfile, currentProfile, verifyProfile, adminverifyProfile, adminverifyProfilee} from '../controllers/profiles.js';

// require('dotenv').config();
// const mongoURI = process.env.MONGOO_URI;
// const conn = monoose.createConnection(mongoURI,{
//     useNewUrlParser:true,
//     useUnifiedTopology:true,
//     useCreateIndex:true
// });

// let gfs;
// conn.once('open', ()=> {
//     gfs = new monoose.mongo.GridFSBucket(conn.db, {
//         bucketName: 'images'
//     });
// });

// const Storage = new GridFsStorage({
//     url:mongoURI,
//     options:{useUnifiedTopology:true},
//     file: (req,file)=> {
//         return new Promise((resolve,reject)=> {
//             crypto.randomBytes(16,(err,buf)=>{

//                 if(err){
//                     return reject(err);
//                 }
//                 const filename = buf.toString('hex') + path.extname(file.orgiginalname);
//                 const fileInfo = {
//                     filename: filename,bucketName:'images'
//                 };
//                 resolve(fileInfo);
//             });
//         });
//     }, 
// });



//All Profiles Route (Hidden:Admins)
router.get('/all',authenticate, allProfiles);

//Apply to Verify Current User's Profile(Hidden:Current User)
router.post('/verify',authenticate, verifyProfile);

// Check Users Profiles For Verification(Hidden:collegeAdmin)
router.get('/adminverify',authenticate, adminverifyProfile);

// Confirm Verification of Users(Hidden:collegeAdmin)
router.post('/adminverify',authenticate, adminverifyProfilee);

// Create or Update Current User's Profile(Hidden:Current User)
router.post('/create', authenticate, createProfile);

// Current User's Profile(Hidden:Current User)
router.get('/current',authenticate, currentProfile);



export default router;



// // Current User's Pro    file(Hidden:Current User)
// router.get('/        current',authenticate ,function(req, res){
//                 res.json({status:'200',UserId:req.userInfo.id, UserEmail:req.userInfo.email, UserType:req.userInfo.type});
// });
