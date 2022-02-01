import Profile from '../models/profile.js';



// ==================================


import multer from 'multer';

import cloudinary from '../utils/cloudinary.js'
import profile from '../models/profile.js';

export const newApplication = async(req,res) => {
    try {
        const applicationFields = {};
        applicationFields.applications = {};    
        applicationFields.applications.currentApplication = {};    
        const {travelOption,startLocation,endLocation,travelPassPeriod} = req.body;
        // const {travelOption,startLocation,endLocation,travelPassPeriod,addressProof,cloudinaryId} = applicationFields.applications.currentApplication;
        // console.log(travelOption,startLocation,endLocation,travelPassPeriod);
        const result = await cloudinary.uploader.upload(req.file.path);
        if(travelOption)  applicationFields.applications.currentApplication.travelOption = travelOption;
        if(startLocation) applicationFields.applications.currentApplication.startLocation = startLocation;
        if(endLocation) applicationFields.applications.currentApplication.endLocation = endLocation;
        applicationFields.applications.currentApplication.applicationStatus = 'Under Process';
        applicationFields.applications.currentApplication.addressProof=result.secure_url;
        if(travelPassPeriod) applicationFields.applications.currentApplication.travelPassPeriod = travelPassPeriod;
        
        // Update
        Profile.findOne({user:req.userId}).then( async profilee => {  
            const newApp = {
                travelOption:travelOption,
                startLocation:startLocation,
                endLocation:endLocation,
                travelPassPeriod:travelPassPeriod,
                applicationStatus:"Under Process",
                addressProof:result.secure_url
            };
            console.log(profilee);
            // Add new app to allApps array
            profilee.applications.allApplications.unshift(newApp);
            profilee.save();
            
            if(profilee){
            Profile.findOneAndUpdate(
                    {user: req.userId},
                    {$set: applicationFields},
                    {new: true}
            ).then( profilee => res.json({status:200,profilee}));
            
        }else{
                // Create
                new Profile(applicationFields).save().then(async profilee =>  res.json({status:200,profilee}));
            }    
        });
        // Profile.findOne({ user: req.userId }).then(profil => {
                
        //         const newApp = {
        //             travelOption:travelOption,
        //             startLocation:startLocation,
        //             endLocation:endLocation,
        //             travelPassPeriod:travelPassPeriod,
        //             applicationStatus:"Under Process",
        //             addressProof:result.secure_url
        //         };
        //         console.log(profil);
        //         // Add new app to allApps array
        //         profil.applications.allApplications.unshift(newApp);
        //         profil.save().then(profil => res.json(profil));
            
            

        //     });
        } catch (error) {
        console.log(error);
        res.json({status:'500', errorr:error});        
    }
}

// =============================
export const adminverifyapp = async(req,res) => {
    try {
        Profile.findOne({profileVerifyApplied:true,email:req.body.email,collegeName:req.userInfo.collegeName,profileVerifystatus:'Verified','applications.currentApplication.applicationStatus':'Under Process'}).then(profileToApproove => {
            console.log(profileToApproove);
            if (profileToApproove) {
                Profile.findOneAndUpdate(
                    {email:req.body.email,'applications.currentApplication.applicationStatus':"Under Process"},
                    {$set:{'applications.currentApplication.applicationStatus':"Approoved",'applications.currentApplication.applicationAcceptedOn':Date().toString()}},
                    {new: true}
                    ).then( async() => {
                        const unApproovedProfiles = await Profile.find({'applications.currentApplication.applicationStatus':"Under Process"});
                        const approoveddProfiles = await Profile.find({'applications.currentApplication.applicationStatus':"Approoved"});
                        const userType = req.userInfo.type;
                        if(userType ==='college admin'){
                           res.json({status:'Successfully Verified!',unApproovedProfiles,approoveddProfiles});
                        }else{
                            res.json({error:'Need Admin Privilages To Access This Route.'});
                        }
                    })
                } else {
                res.json({ status:404,error:'There is no Profile to be verified And/Or The profile is already verified And/Or Need Admin Privilages'});
            }
                   
        })
    } catch (error) {
        res.json({status:400, message:error});
    }
}


// =============================


// export const adminverifyapp = async(req,res) => {
    // try {
        // Profile.findOne({'applications[0].currentApplication.applicationStatus':"Under Process",email:req.body.email}).then( async applicationToVerify => {
            // let calm = applicationToVerify;
            // console.log(calm.applications);

            // if(applicationToVerify){
                // let calmy = applicationToVerify;
                // console.log(calmy);
                // console.log(calmy.applications[0].currentApplication.applicationStatus);
                // (calmy.applications[0].currentApplication.applicationStatus);
                
                // Profile.findOneAndUpdate(
                //     {'applications[0].currentApplication.applicationStatus':'Under Process','email':'req.body.email'},
                //     {$set:{'applications[0].currentApplication.applicationStatus':'Approoved','applications[0].currentApplication.applicationAcceptedOn':Date().toString()}},
                //     {new: true}
                //     ).then( async() => {
                //     console.log(calmy.applications);
                // const approovedProfiles = await Profile.find({'applications[0].currentApplication.applicationStatus':'Under Process'});
                // console.log('halo= ' + approovedProfiles);
                    // const unappoovedProfiles = await Profile.find({profileVerifystatus:'UnVerified', collegeName:req.userInfo.collegeName,applicationStatus:'Under Process'});
                    // const userType = req.userInfo.type;
                    // if(userType ==='college admin' || userType==='bus admin' || userType ==='train admin'){
                        // res.json({status:'Successfully Approoved!',approovedProfiles});
                    // }else{
                        // res.json({error:'Need Admin Privilages To Access This Route.'});
                    // }
                // });
            // }else{
                // res.json({ status:404,error:'There is no Application to be Approoved And/Or The Application is already Approoved And/Or Need Admin Privilages'})
            // }
//         })
//     } catch (error) {
//         res.json({status:400, message:error});   
//     }

// }




export const adminverifyProfileAll = async(req,res) => {
    try {
        const unVerifiedProfiles = await Profile.find({profileVerifyApplied:true,collegeName:req.userInfo.collegeName,profileVerifystatus:'UnVerified'});
        const verifiedProfiles = await Profile.find({profileVerifyApplied:true, collegeName:req.userInfo.collegeName,profileVerifystatus:'Verified'});
        const userType = req.userInfo.type;
        if(userType ==='college admin'){
            return res.json({unVerifiedProfiles,verifiedProfiles});
        }else{
            res.json({error:'Need Admin Privilages To Access This Route.'});
        }
    } catch (error) {
        res.json({error:error});
    }
}

// Get Route for collegeAdmin to view Users Profiles for Verification
export const adminverifyProfile = async(req,res) => {
    try {
        const profiles = await Profile.find({profileVerifyApplied:true,collegeName:req.userInfo.collegeName,profileVerifystatus:'UnVerified'});
        const userType = req.userInfo.type;
        if(userType ==='college admin'){
            return res.json(profiles);
        }else{
            res.json({erroMsg:'Need Admin Privilages To Access This Route.'});
        }
    } catch (error) {
        res.json({errorMsg:error});
    }
}

// // Post Route For Admin To Verify custom User's Profile
// export const adminverifyProfilee = async(req,res) => {
//     try {
//         Profile.findOne({profileVerifyApplied:true,email:req.body.email,collegeName:req.userInfo.collegeName}).then(profileToVerify => {
//             if (profileToVerify) {
//                 Profile.findOneAndUpdate(
//                     {profileVerifyApplied:true,email:req.body.email},
//                     {$set:{profileVerifystatus:'Verified'}}
//                     ).then(res.json({status:200, message:'Profile Verified'}));
//                 } else {
//                     res.json({status:404,message:'There is no profile to be verified'});
//                 }
//             }
//             )
//         } catch (error) {
//             res.json({status:400, message:error});
//     }
// }

// Post Route For Admin To Verify custom User's Profile

export const adminverifyProfilee = async(req,res) => {
    try {
        Profile.findOne({profileVerifyApplied:true,email:req.body.email,collegeName:req.userInfo.collegeName,profileVerifystatus:'UnVerified'}).then(profileToVerify => {
            console.log(req.userInfo.collegeName);
            if (profileToVerify) {
                Profile.findOneAndUpdate(
                    {profileVerifyApplied:true,email:req.body.email},
                    {$set:{profileVerifystatus:'Verified',profileVerifyDate:Date().toString()}},
                    {new: true}
                    ).then( async() => {
                        const unVerifiedProfiles = await Profile.find({profileVerifyApplied:true,collegeName:req.userInfo.collegeName,profileVerifystatus:'UnVerified'});
                        const verifiedProfiles = await Profile.find({profileVerifyApplied:true, collegeName:req.userInfo.collegeName,profileVerifystatus:'Verified'});
                        const userType = req.userInfo.type;
                        if(userType ==='college admin'){
                           res.json({status:'Successfully Verified!',unVerifiedProfiles,verifiedProfiles});
                        }else{
                            res.json({error:'Need Admin Privilages To Access This Route.'});
                        }
                    })
                } else {
                res.json({ status:404,error:'There is no Profile to be verified And/Or The profile is already verified And/Or Need Admin Privilages'});
            }
                   
        })
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
                {$set: {profileVerifyApplied:true}},
                {new: true}
                ).then(profilee => res.json({status:200, profilee,message:'Profile successfully sent for verification'}));
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
        const profiles = await Profile.find();
        const userType = req.userInfo.type;
        console.log(userType);
        if(userType === 'bus admin' || userType==='college admin' || userType==='railway admin'){
            return res.json({status:200,profiles});
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
        const {nameAsPerIdCard,dateOfBirth,collegeName,branchName,currentYearOfStudy} = req.body;
        let profileFields = {};
        const result = await cloudinary.uploader.upload(req.file.path);
        console.log(result);
        profileFields.user = req.userId;
        profileFields.userTypee = req.userInfo.type;
        profileFields.cloudinaryId=result.public_id;
        profileFields.collegeId=result.secure_url;
        
        profileFields.email = req.userInfo.email;
        if(nameAsPerIdCard) profileFields.nameAsPerIdCard = nameAsPerIdCard;
        if(dateOfBirth) profileFields.dateOfBirth = dateOfBirth;
        if (collegeName) profileFields.collegeName = collegeName;
        if(branchName) profileFields.branchName=branchName;
        if(currentYearOfStudy) profileFields.currentYearOfStudy=currentYearOfStudy;
        
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
        console.log(error);
        res.json({status:'500', errorr:error});        
    }
} 

//Get Route to View Current User's Profile
export const currentProfile = async (req,res) => {
    try{
        const profile = await Profile.findOne({user:req.userId}).populate('user',['name','type']);
        if(!profile) return res.json({status:'400',message:'There is no profile for this user. Please Create one at `profile/create`'});
        res.json({status:200,profile});
    } catch(err){
        res.json({status:'500', error:'Server Error'});
    } 
}


import PDFDocument from "pdfkit";
import user from '../models/user.js';

export const pdfGen = async (req, res, next) => {
    
    const userprofile = await Profile.findOne({user:req.userId}).populate('user',['name','type']);
    function buildPDF(datacallback, endcallback) {
        const doc = new PDFDocument({size: 'A4'});
        doc.on('data',datacallback);
        doc.on('end',endcallback);
        doc.image('logo.png', 50, 45, { width: 50 })
        // doc.image('https://res.cloudinary.com/dxi0gikd0/image/upload/v1641390665/lt0ctidyhfdkt31fqcl8.jpg', {
        //     fit: [250, 300],
        //     align: 'center',
        
        //     valign: 'center'
        // });
        doc.lineWidth(6);
        doc.lineCap('butt').moveTo(40, 20).lineTo(571, 20).stroke();
        doc.lineCap('butt').moveTo(43, 20).lineTo(40, 820).stroke();
        doc.lineCap('butt').moveTo(568, 20).lineTo(565, 820).stroke();
        doc.lineCap('butt').moveTo(42, 817).lineTo(565, 817).stroke();
        doc.font('IBMPlexSansThaiLooped-Bold.ttf').fontSize(60).fillColor('cyan').text(`${userprofile.nameAsPerIdCard}`,115,20);
        doc.fontSize(55).fillColor('gray').text(`From: ${userprofile.applications.currentApplication.startLocation.toUpperCase()} `,100,140,{continued:true}).fillColor('black').text(`To: ${userprofile.applications.currentApplication.endLocation.toUpperCase()}`);
        doc.fontSize(25).fillColor('black').text(`Means Of Transport:- ${userprofile.applications.currentApplication.travelOption.toUpperCase()}`,100,340);
        // doc.moveTo(0, 160).lineTo(200, 160).lineTo(400, 160).stroke();
        doc.fontSize(25).fillColor('black').text(`Applied On:- ${userprofile.applications.currentApplication.appliedOn.slice(0,16)}`,100,400);
        doc.fontSize(25).fillColor('black').text(`Valid For:- ${userprofile.applications.currentApplication.travelPassPeriod.toUpperCase()}`,100,460);
        doc.fontSize(25).fillColor('black').text(`College:- ${userprofile.collegeName.toUpperCase()}`,100,520);
        doc.fontSize(25).fillColor('black').text(`Date Of Birth:- ${userprofile.dateOfBirth}`,100,580);
        doc.fontSize(25).fillColor('black').text(`   `,100,686);
        doc.fontSize(25).fillColor('black').text(`Email:- ${userprofile.email}`,{align:'right'});
        doc.end();
    }
    
    const stream = res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment;filename=ConcessionLetter.pdf`,
    });

    buildPDF(
        (chunk) => stream.write(chunk),
        () => stream.end()
      );
};






