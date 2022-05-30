import Profile from '../models/profile.js';
import PDFDocument from "pdfkit";
import cloudinary from '../utils/cloudinary.js'
import User from '../models/user.js';

import QRCode from 'qrcode';
import nodemailer from 'nodemailer';
// import Razorpay from 'razorpay'; 

// ==========================
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'easypass24@gmail.com',
      pass: 'Easypass123'
    }
  });
  
//   var mailOptions = {
//     from: 'easypass24@gmail.com',
//     to: profile.email,
//     subject: 'Register',
//     text: `Hi ${cal} Thank You For Registering To EasyPass, Hope You Have A Wonderfull & Hassle-Free Experience`
//   };
  
//   transporter.sendMail(mailOptions, function(error, info){
//     if (error) {
//       console.log(error);
//     } else {
//       console.log('Email sent: ' + info.response);
//     }
//   });

export const proPic = async(req,res) => {
    try {
        let profileFields = {};
        const result = await cloudinary.uploader.upload(req.file.path);
        // console.log(result);
        profileFields.cloudinaryProfileId=result.public_id;
        profileFields.profilePic=result.secure_url;
        Profile.findOne({user:req.userId}).then(async profilee  => {
            console.log(req.userId);
            if(profilee){
                Profile.findOneAndUpdate(
                    {user: req.userId},
                    {$set: profileFields},
                    {new: true}
                    ).then(profilee =>res.json({status:200,profilee}));
                }else{
                    res.json({status:400, message:'No existing profile found'});
                }    
            });
    } catch (error) {
        console.log(error);
        res.json({status:500, error})
    }
}

export const passInfoCreate = async(req,res) => {
try {
    const passinfopro = await Profile.findOne({user:req.userId});
    let passInfo = [];
    passInfo.push(passinfopro.applications.currentApplication);
    const current = new Date();
    const validity = passInfo[0].travelPassPeriod.charAt(0);
    const val = Number(validity);
    const date = new Date()
    date.setMonth(date.getMonth() + val);      
    let passfields = {};
    passfields.passinfo = {};
    if((date -  current)>=0){
        passfields.passinfo.passStatus = "Active";
    }else{
        passfields.passinfo.passStatus = "Expired";
    }
    console.log(passinfopro);
    passfields.passinfo.passValidity = passInfo[0].travelPassPeriod;
    passfields.passinfo.profilePic = passinfopro.profilePic;
    passfields.passinfo.passType = passInfo[0].travelOption;
    passfields.passinfo.passStartDate = passInfo[0].appliedOn;
    passfields.passinfo.passEndDate = date.toString();
    passfields.passinfo.passRoute = passInfo[0].startLocation+" to " + passInfo[0].endLocation;

    // res.json({status:200,resp:"COOL"});
    Profile.findOne({user:req.userId}).then(profilee => {
        if(profilee){
            Profile.findOneAndUpdate(
                {user: req.userId},
                {$set: passfields},
                {new: true}
                ).then(profilee =>res.json({status:200,profilee}));
            }else{
                // Create
                res.json({status:400,Message:"Please Create a Profile First"});
                // new Profile(profileFields).save().then(profilee => res.json({status:200,profilee}));
            }    
        });

} catch (error) {
    res.json({status:500, message:error});
}
};


export const deleteAccount = async(req,res) => {
    try {
        const delP = await Profile.deleteOne({email:req.userInfo.email});
        console.log(req.userInfo.email);
        const delU = await User.deleteOne({email:req.userInfo.email});
        console.log(delP,delU)
        res.json({status:200,response:"Account Successully Deleted!"});
    } catch (error) {
        res.json({status:500,message:error});
    }
}

//-----------------------USER ROUTES--------------------------

// Post Route to Create or Update User's Profile
export const createProfile = async(req,res) => {
    try {    
        // Profile Object
        const {nameAsPerIdCard,dateOfBirth,collegeName,branchName,currentYearOfStudy} = req.body;
        let profileFields = {};
        const result = await cloudinary.uploader.upload(req.file.path);
        // console.log(result);
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
        // console.log(error);
        res.json({status:'500', errorr:error});        
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
                ).then(profilee => {
                    console.log(profilee.email);
                    console.log(profilee.nameAsPerIdCard);
                    var mailOptions = {
                    from: 'easypass24@gmail.com',
                    to: profilee.email,
                    subject: 'Profile Verification',
                    text: `
            Hi ${profilee.nameAsPerIdCard.charAt(0).toUpperCase()+ profilee.nameAsPerIdCard.slice(1)},
                    
                Your Profile Has Been Succssfully Sent For Verification. Please Wait For A Few Days For A Response.
            
            
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
            
                    res.json({status:200, profilee,message:'Profile successfully sent for verification'});
                
                }) 
            }else{
                res.json({status:401, message:'Please Create a Profile before applying for verification or Please check if profile is already applied for verification'})       
        }    
        });
    } catch (error) {
        res.json({status:'500', errorr:error});        
    }
}


//Get Route to View Current User's Profile
export const currentProfile = async (req,res) => {
    try{
        // console.log("cool");
        const profile = await Profile.findOne({user:req.userId}).populate('user');
        if(!profile) return res.json({status:'400',message:'There is no profile for this user. Please Create one at `profile/create`'});
        // const generateQR = async text =>{
            // try {
        // let passfields = {};
        // passfields.passinfo = {};
        // if((profile.passinfo.passEndDate -  passStartDate)>=0){
        //     passfields.passinfo.passStatus = "Active";
        // }else{
        //     passfields.passinfo.passStatus = "Expired";
        // }
        // Profile.findOneAndUpdate(
        //     {user:req.userId},
        //     {$set: passfields},
        //     {new:true}
        // )
        if(!profile.qrcode){

            const url = "http://google.com";
            const qrco = await QRCode.toDataURL(url);
            console.log(qrco);

        Profile.findOneAndUpdate(
            {user: req.userId},
            {$set: {qrcode:qrco}},
            {new: true}
        ).then( newprofile => {
            // console.log(newprofile.qrcode);
            var mailOptions = {
                from: 'easypass24@gmail.com',
                to: newprofile.email,
                subject: 'PassQR Generated',
                text: `
        Hi ${newprofile.nameAsPerIdCard.charAt(0).toUpperCase()+ newprofile.nameAsPerIdCard.slice(1)},
                
           Your Pass QRCode Has Been Successfully Generated! Please Find It Attached Below.
        
        
        Thank You!
        EasyPass`,
        attachments: [
            {
                filename: "PassQR.png",
                path: newprofile.qrcode, // <-- should be path instead of content
                cid: "pin-marker.png"
            }
          ]
          
        };
                transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });   
                // console.log(isLater(newprofile.passinfo.passEndDate));
                res.json({status:200, newprofile});
                
            }
            )
        }else{
            // let now = new Date();
            // console.log(now);
            // console.log(now.toString());
            // let won = now.toString();
            // console.log(won);
            
            console.log(profile.passinfo.passEndDate,profile.passinfo.passStartDate)
            console.log(profile.passinfo.passEndDate<profile.passinfo.passStartDate);
            console.log('qr already generated!');
            res.json({status:200, profile});
        }
        } catch(err){
            res.json({status:'500', error:'Server Error',err});
    } 
}

//Create New Application For Concession Letter
export const newApplication = async(req,res) => {
    try {
        const applicationFields = {};
        applicationFields.applications = {};    
        applicationFields.applications.currentApplication = {};    
        const {travelOption,startLocation,endLocation,travelPassPeriod} = req.body;
        const result = await cloudinary.uploader.upload(req.file.path);
        if(travelOption)  applicationFields.applications.currentApplication.travelOption = travelOption;
        if(startLocation) applicationFields.applications.currentApplication.startLocation = startLocation;
        if(endLocation) applicationFields.applications.currentApplication.endLocation = endLocation;
        
        applicationFields.applications.currentApplication.name = req.userInfo.name;
        applicationFields.applications.currentApplication.email = req.userInfo.email;
        applicationFields.applications.currentApplication.passGiven = false;
        applicationFields.applications.currentApplication.applicationStatus = 'Under Process';
        applicationFields.applications.currentApplication.addressProof=result.secure_url;
        if(travelPassPeriod) applicationFields.applications.currentApplication.travelPassPeriod = travelPassPeriod;
        applicationFields.applications.currentApplication.appliedOn=Date().toString();
        // const validity = req.body.travelPassPeriod.charAt(0);
        // const current = new Date();
        // const val = Number(validity);
        // const date = new Date()
        // date.setMonth(date.getMonth() + val);      
        // console.log('tis is '+date);
        // console.log(date -  current);  // true
        // d1 <= d2; // true
        // d1 >  d2; // false
        // d1 >= d2; // false
        // console.log(currentDate.toString());
        // console.log(expDate);
        
        // applicationFields.applications.currentApplication.validTill=date.toString();

        // Update
        Profile.findOne({user:req.userId}).then( async profilee => {  
            const newApp = {

                name:req.userInfo.name,
                email:req.userInfo.email,

                travelOption:travelOption,
                startLocation:startLocation,
                endLocation:endLocation,
                travelPassPeriod:travelPassPeriod,
                applicationStatus:"Under Process",
                addressProof:result.secure_url,
                appliedOn:Date().toString()
                // validTill:dae.toString()


            };
            // Add new app to allApps array
            profilee.applications.allApplications.unshift(newApp);
            profilee.save();
            
            if(profilee){
            Profile.findOneAndUpdate(
                    {user: req.userId},
                    {$set: applicationFields},
                    {new: true}
            ).then( async profilee => {
                // console.log(profilee);
                const profi = await Profile.findOne({user:req.userId});
                // console.log(profi);
                res.json({status:200,profi});
            }
            );
            
        }else{
            profilee.applications.allApplications.unshift(newApp);
            profilee.save();
            
                // Create
                new Profile(applicationFields).save().then(async profilee =>  {
                    // console.log(profilee);
                    const profi = await Profile.findOne({user:req.userId});
                    // console.log(profi);
                    res.json({status:200,profi})
                }
                );
            }    
        });
        } catch (error) {
        // console.log(error);
        res.json({status:'500', errorr:error});        
    }
}


//Get Route to View Current User's Applications
export const myApps = async (req,res) => {
    try{
        const profile = await Profile.findOne({email:req.userInfo.email}).populate('user');
        if(!profile) return res.json({status:'400',message:'There is no profile for this user. Please Create one at `profile/create`'});
        // const origin = profile.applications.currentApplication.startLocation; 
        // // const dest = profile.applications.currentApplication.endLocation;
        // const period = profile.applications.currentApplication.travelPassPeriod;
        // // console.log(dest,origin); 
        // // console.log(profile); 
        // let amountToPay; 
        // if (origin == 'Ghorawadi' || origin == 'Begdewadi' || origin =='Dehu Road' || origin == 'Vadgaon') {
        //     if (period == '1 month'){
        //         amountToPay = '60'
        //     }else if(period == '3 months'){
        //         amountToPay = '160';
        //     }else if(period == '6 months'){
        //         amountToPay = '280';
        //     }    
        //     Profile.findOneAndUpdate(
        //         {email:req.userInfo.email,'applications.currentApplication.applicationStatus':"Approved"},
        //         {$set: {'applications.currentApplication.amount':amountToPay, 'applications.allApplications.0.amount':amountToPay}},
        //         {new: true}).then(
        //             async() => {
        //                 const myApp = await Profile.findOne({email:req.userInfo.email}).populate('user');
        //                 res.json({status:200,myApp});
        //             })
        // }else if(origin == 'Akurdi' || origin == 'Chinchwad' || origin =='Pimpri' || origin == 'Kamshet' || origin == 'Kanhe') {
        //     // let amountToPay; 
        //     if (period == '1 month'){
        //         amountToPay = '90'
        //     }else if(period == '3 months'){
        //         amountToPay = '210';
        //     }else if(period == '6 months'){
        //         amountToPay = '380';
        //     }    
        //     Profile.findOneAndUpdate(
        //         {email:req.userInfo.email,'applications.currentApplication.applicationStatus':"Approved"},
        //         {$set: {'applications.currentApplication.amount':amountToPay, 'applications.allApplications.0.amount':amountToPay}},
        //         {new: true}).then(
        //             async() => {
        //                 const myApp = await Profile.findOne({email:req.userInfo.email}).populate('user');
        //                 res.json({status:200,myApp});
        //             })
        // }else if(origin == 'Kasarwasi' || origin == 'Dapodi' || origin == 'khadki' || origin == 'Malavli') {
        //     // let amountToPay; 
        //     if (period == '1 month'){
        //         amountToPay = '130'
        //     }else if(period == '3 months'){
        //         amountToPay = '245';
        //     }else if(period == '6 months'){
        //         amountToPay = '480';
        //     }     
        //     Profile.findOneAndUpdate(
        //         {email:req.userInfo.email,'applications.currentApplication.applicationStatus':"Approved"},
        //         {$set: {'applications.currentApplication.amount':amountToPay, 'applications.allApplications.0.amount':amountToPay}},
        //         {new: true}).then(
        //             async() => {
        //                 const myApp = await Profile.findOne({email:req.userInfo.email}).populate('user');
        //                 res.json({status:200,myApp});
        //             })
        // }else if(origin == 'Pune' || origin == 'Shivajinagar' || origin =='Lonawala') {
        //     // let amountToPay; 
        //     if (period == '1 month'){
        //         amountToPay = '160'
        //     }else if(period == '3 months'){
        //         amountToPay = '320';
        //     }else if(period == '6 months'){
        //         amountToPay = '515';
        //     }  
        //     Profile.findOneAndUpdate(
        //         {email:req.userInfo.email,'applications.currentApplication.applicationStatus':"Approved"},
        //         {$set: {'applications.currentApplication.amount':amountToPay, 'applications.allApplications.0.amount':amountToPay}},
        //         {new: true}).then(
        //             async() => {
        //                 const myApp = await Profile.findOne({email:req.userInfo.email}).populate('user');
        //                 res.json({status:200,myApp});
        //             })
        // }else{
        //     res.json({status:200,profile});
        // }

        // res.json({status:200,profile});
    } catch(err){
        res.json({status:'500', error:'Server Error'});
    } 
}


//-----------------------ADMIN ROUTES--------------------------


//Get Route for Admins To View all Users
export const allUsers = async(req,res) => {
    try {
        const Users = await User.find();
        const userType = req.userInfo.type;
        // console.log(userType);
        if(userType === 'bus admin' || userType==='college admin' || userType==='railway admin'){
            return res.json({status:200,Users});
        }else{
            res.json({erroMsg:'Need Admin Privilages To Access This Route.'});
        }
    } catch (error) {
        res.json({errorMsg:error});
    }
}

//Get Route for Admins To View All Profiles
export const allProfiles = async(req,res) => {
    try {
        const profiles = await Profile.find();
        const userType = req.userInfo.type;
        // console.log(userType);
        if(userType === 'bus admin' || userType==='college admin' || userType==='railway admin'){
            return res.json({status:200,profiles});
        }else{
            res.json({erroMsg:'Need Admin Privilages To Access This Route.'});
        }
    } catch (error) {
        res.json({errorMsg:error});
    }
}

// Get Route For collegeAdmin To View Only UnVerified Profiles
export const adminverifyProfile = async(req,res) => {
    try {
        const profiles = await Profile.find({profileVerifyApplied:true,collegeName:req.userInfo.collegeName,profileVerifystatus:'UnVerified'});
        const userType = req.userInfo.type;
        console.log(first)
        if(userType ==='college admin'){
            return res.json({status:200 , profiles});
        }else{
            res.json({status:400,erroMsg:'Need Admin Privilages To Access This Route.'});
        }
    } catch (error) {
        res.json({errorMsg:error});
    }
}

//Get Route For List Of ALl the Verified Profiles & All the UnVerified Profiles Requiring Verification   **
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

//Post Route For Admin To Verify Unverified Profile & Return All The Verified & UnVerified Profiles
export const adminverifyProfilee = async(req,res) => {
    try {
        Profile.findOne({profileVerifyApplied:true,email:req.body.email,collegeName:req.userInfo.collegeName,profileVerifystatus:'UnVerified'}).then(profileToVerify => {
            // console.log(req.userInfo.collegeName);
            if (profileToVerify) {
                Profile.findOneAndUpdate(
                    {profileVerifyApplied:true,email:req.body.email},
                    {$set:{profileVerifystatus:'Verified',profileVerifyDate:Date().toString()}},
                    {new: true}
                    ).then( async profileToVerify => {
                        console.log(profileToVerify);
                        console.log(profileToVerify.nameAsPerIdCard);
                        // const imgurl = "data:image/png;base64,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"
                        var mailOptions = {
                            from: 'easypass24@gmail.com',
                            to: profileToVerify.email,
                            subject: 'Profile Verification Done!',
                            text: `
                    Hi ${profileToVerify.nameAsPerIdCard.charAt(0).toUpperCase()+ profileToVerify.nameAsPerIdCard.slice(1)},
                            
                        Your Profile Has Been Succssfully Verified!. You Can Now Apply For Railway/Bus Applications To Get Your Concession-Letter & Pass.
                    
                    
                    Thank You!
                    EasyPass`
                    
                            // html:<img src = ""></img>
        
                            };
                            transporter.sendMail(mailOptions, function(error, info){
                                if (error) {
                                    console.log(error);
                                } else {
                                    console.log('Email sent: ' + info.response);
                                }
                            });   
        
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

//Post Route For Admin To Reject Unverified Profile & Return All The Verified & UnVerified Profiles
export const adminRejectProfilee = async(req,res) => {
    try {
        Profile.findOne({profileVerifyApplied:true,email:req.body.email,collegeName:req.userInfo.collegeName,profileVerifystatus:'UnVerified'}).then(profileToVerify => {
            // console.log(req.userInfo.collegeName);
            if (profileToVerify) {
                Profile.findOneAndUpdate(
                    {profileVerifyApplied:true,email:req.body.email},
                    {$set:{profileVerifystatus:'Rejected',profileVerifyDate:Date().toString()}},
                    {new: true}
                    ).then( async profileToVerify => {
                        var mailOptions = {
                            from: 'easypass24@gmail.com',
                            to: profileToVerify.email,
                            subject: 'Profile Verification Rejected!',
                            text: `
                    Hi ${profileToVerify.nameAsPerIdCard.charAt(0).toUpperCase()+ profileToVerify.nameAsPerIdCard.slice(1)},
                            
                        Your Profile Has Been Rejected!. Please Apply For A New Profile.
                    
                    
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
        
                        const unVerifiedProfiles = await Profile.find({profileVerifyApplied:true,collegeName:req.userInfo.collegeName,profileVerifystatus:'UnVerified'});
                        const verifiedProfiles = await Profile.find({profileVerifyApplied:true, collegeName:req.userInfo.collegeName,profileVerifystatus:'Verified'});
                        const userType = req.userInfo.type;
                        if(userType ==='college admin'){
                            const deletedP = await Profile.deleteOne({email:req.body.email});
                            console.log(deletedP);
                           res.json({status:'Successfully Rejected!',unVerifiedProfiles,verifiedProfiles});
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


// Get Route for collegeAdmin To View Only UnApproved Applications **
export const adminUnApprovedProfiles = async(req,res) => {
    try {
        const unapprovedRailProfiles = await Profile.find({collegeName:req.userInfo.collegeName,'applications.currentApplication.applicationStatus':'Under Process'});
        const userType = req.userInfo.type;
        if(userType ==='college admin'){
            return res.json({status:200, unapprovedProfiles});
        }else{
            res.json({erroMsg:'Need Admin Privilages To Access This Route.'});
        }
    } catch (error) {
        res.json({errorMsg:error});
    }
}
//Get Route For Admin To View All Applications 
export const adminGetApp = async(req,res) => {
    try {
        const unapprovedProfiles = await Profile.find({collegeName:req.userInfo.collegeName,'applications.currentApplication.applicationStatus':'Under Process'});
        const approvedProfiles = await Profile.find({collegeName:req.userInfo.collegeName,'applications.allApplications.applicationStatus':'Approved'});
        const rejectedProfiles = await Profile.find({collegeName:req.userInfo.collegeName,'applications.allApplications.applicationStatus':'Rejected'});
        const userType = req.userInfo.type;
        if(userType ==='college admin'){
            let unapprovedApps = [];
            for (let i = 0; i < unapprovedProfiles.length; i++) {
                unapprovedApps.push(unapprovedProfiles[i].applications.currentApplication);
            }
            // let rejectedApps = [];
            let approvedApps = [];
            var promises = [];
            for (let i = 0; i < rejectedProfiles.length; i++) {
                approvedApps.push(rejectedProfiles[i].applications.currentApplication);
            }
            for (let i = 0; i < approvedProfiles.length; i++) {
                promises.push(
                    new Promise((resolve, reject) => {
                        for(let j= 0; j<approvedProfiles[i].applications.allApplications.length; j++){
                            if(approvedProfiles[i].applications.allApplications[j].applicationStatus=="Approved")
                            approvedApps.push(approvedProfiles[i].applications.allApplications[j]);
                            resolve()
                        }
                    })
                    )
                }
                Promise.all(promises).then(() => {
                    return res.json({status:200, unapprovedApps,approvedApps});
                })
        }else{
            res.json({erroMsg:'Need Admin Privilages To Access This Route.'});
        }
    } catch (error) {
        res.json({errorMsg:error});
    }
}

// Post Route For Admin to Approve New Application of Concession Letter **
// collegeName:req.userInfo.collegeName,
export const adminApproveApp = async(req,res) => {
    try {
        Profile.findOne({profileVerifyApplied:true,email:req.body.email,profileVerifystatus:'Verified','applications.currentApplication.applicationStatus':'Under Process'}).then(profileToApproove => {
            if (profileToApproove) {
                // return res.json(profileToApproove.applications.allApplications[0].applicationStatus);
                // ===================================================================
                // console.log(profileToApproove);
                // const requestedProfile = Profile.findOne({email:req.body.email});
                const origin = profileToApproove.applications.currentApplication.startLocation;
                let amount;
                if(origin){
        
                    // const dest = profileToApproove.applications.currentApplication.endLocation;
                    const period = profileToApproove.applications.currentApplication.travelPassPeriod.toLowerCase();
                    
                    const via = profileToApproove.applications.currentApplication.travelOption;
                    // console.log(dest,origin); 
                    // console.log(profile); 
                    if(via == "Local / Train"){
                        
                        let amountToPay; 
                        if (origin == 'Ghorawadi' || origin == 'Begdewadi' || origin =='Dehu Road' || origin == 'Vadgaon') {
                            if (period == '1 month'){
                            amountToPay = '60'
                        }else if(period == '3 months'){
                            amountToPay = '160';
                        }else if(period == '6 months'){
                            amountToPay = '280';
                        }
                        amount = amountToPay;    
                        // Profile.findOneAndUpdate(
                        //     {email:req.userInfo.email,'applications.currentApplication.applicationStatus':"Approved"},
                        //     {$set: {'applications.currentApplication.amount':amountToPay, 'applications.allApplications.0.amount':amountToPay}},
                        //     {new: true}).then(
                        //         async() => {
                        //             const myApp = await Profile.findOne({email:req.userInfo.email}).populate('user');
                        //             res.json({status:200,myApp});
                        //         })
                    }else if(origin == 'Akurdi' || origin == 'Chinchwad' || origin =='Pimpri' || origin == 'Kamshet' || origin == 'Kanhe') {
                        // let amountToPay; 
                        if (period == '1 month'){
                            amountToPay = '90'
                        }else if(period == '3 months'){
                            amountToPay = '210';
                        }else if(period == '6 months'){
                            amountToPay = '380';
                        }    
                        amount = amountToPay;    
                        // Profile.findOneAndUpdate(
                        //     {email:req.userInfo.email,'applications.currentApplication.applicationStatus':"Approved"},
                        //     {$set: {'applications.currentApplication.amount':amountToPay, 'applications.allApplications.0.amount':amountToPay}},
                        //     {new: true}).then(
                        //         async() => {
                        //             const myApp = await Profile.findOne({email:req.userInfo.email}).populate('user');
                        //             res.json({status:200,myApp});
                        //         })
                    }else if(origin == 'Kasarwadi' || origin == 'Dapodi' || origin == 'khadki' || origin == 'Malavli') {
                        // let amountToPay; 
                        if (period == '1 month'){
                            amountToPay = '130'
                        }else if(period == '3 months'){
                            amountToPay = '245';
                        }else if(period == '6 months'){
                            amountToPay = '480';
                        }     
                        // Profile.findOneAndUpdate(
                        //     {email:req.userInfo.email,'applications.currentApplication.applicationStatus':"Approved"},
                        //     {$set: {'applications.currentApplication.amount':amountToPay, 'applications.allApplications.0.amount':amountToPay}},
                        //     {new: true}).then(
                        //         async() => {
                        //             const myApp = await Profile.findOne({email:req.userInfo.email}).populate('user');
                        //             res.json({status:200,myApp});
                        //         })
                        amount = amountToPay;    
                    }else if(origin == 'Pune' || origin == 'Shivajinagar' || origin =='Lonawala') {
                        // let amountToPay; 
                        if (period == '1 month'){
                            amountToPay = '160'
                        }else if(period == '3 months'){
                            amountToPay = '320';
                        }else if(period == '6 months'){
                            amountToPay = '515';
                        }  
                        // Profile.findOneAndUpdate(
                        //     {email:req.userInfo.email,'applications.currentApplication.applicationStatus':"Approved"},
                        //     {$set: {'applications.currentApplication.amount':amountToPay, 'applications.allApplications.0.amount':amountToPay}},
                        //     {new: true}).then(
                        //         async() => {
                        //             const myApp = await Profile.findOne({email:req.userInfo.email}).populate('user');
                        //             res.json({status:200,myApp});
                        //         })
                        amount = amountToPay;    
                    }else{
                        amount = "error in start location of train";
                    }
                    }else if(via == "PMPML / Bus"){
                    let amountToPay; 
                    if (origin == 'Ghorawadi' || origin == 'Begdewadi' || origin =='Dehu Road' || origin == 'Vadgaon') {
                        if (period == '1 month'){
                            amountToPay = '90'
                        }else if(period == '3 months'){
                            amountToPay = '180';
                        }else if(period == '6 months'){
                            amountToPay = '300';
                        }    
                        // Profile.findOneAndUpdate(
                        //     {email:req.userInfo.email,'applications.currentApplication.applicationStatus':"Approved"},
                        //     {$set: {'applications.currentApplication.amount':amountToPay, 'applications.allApplications.0.amount':amountToPay}},
                        //     {new: true}).then(
                        //         async() => {
                        //             const myApp = await Profile.findOne({email:req.userInfo.email}).populate('user');
                        //             res.json({status:200,myApp});
                        //         })
                        amount = amountToPay;    
                    }else if(origin == 'Akurdi' || origin == 'Chinchwad' || origin =='Pimpri' || origin == 'Kamshet' || origin == 'Kanhe') {
                        // let amountToPay; 
                        if (period == '1 month'){
                            amountToPay = '110'
                        }else if(period == '3 months'){
                            amountToPay = '230';
                        }else if(period == '6 months'){
                            amountToPay = '400';
                        }    
                        // Profile.findOneAndUpdate(
                        //     {email:req.userInfo.email,'applications.currentApplication.applicationStatus':"Approved"},
                        //     {$set: {'applications.currentApplication.amount':amountToPay, 'applications.allApplications.0.amount':amountToPay}},
                        //     {new: true}).then(
                        //         async() => {
                        //             const myApp = await Profile.findOne({email:req.userInfo.email}).populate('user');
                        //             res.json({status:200,myApp});
                        //         })
                        amount = amountToPay;    
                    }else if(origin == 'Kasarwadi' || origin == 'Dapodi' || origin == 'khadki' || origin == 'Malavli') {
                        // let amountToPay; 
                        if (period == '1 month'){
                            amountToPay = '150'
                        }else if(period == '3 months'){
                            amountToPay = '265';
                        }else if(period == '6 months'){
                            amountToPay = '500';
                        }     
                        // Profile.findOneAndUpdate(
                        //     {email:req.userInfo.email,'applications.currentApplication.applicationStatus':"Approved"},
                        //     {$set: {'applications.currentApplication.amount':amountToPay, 'applications.allApplications.0.amount':amountToPay}},
                        //     {new: true}).then(
                        //         async() => {
                        //             const myApp = await Profile.findOne({email:req.userInfo.email}).populate('user');
                        //             res.json({status:200,myApp});
                        //         })
                        amount = amountToPay;    
                    }else if(origin == 'Pune' || origin == 'Shivajinagar' || origin =='Lonawala') {
                        // let amountToPay; 
                        if (period == '1 month'){
                            amountToPay = '180'
                        }else if(period == '3 months'){
                            amountToPay = '340';
                        }else if(period == '6 months'){
                            amountToPay = '535';
                        }  
                        // Profile.findOneAndUpdate(
                        //     {email:req.userInfo.email,'applications.currentApplication.applicationStatus':"Approved"},
                        //     {$set: {'applications.currentApplication.amount':amountToPay, 'applications.allApplications.0.amount':amountToPay}},
                        //     {new: true}).then(
                        //         async() => {
                        //             const myApp = await Profile.findOne({email:req.userInfo.email}).populate('user');
                        //             res.json({status:200,myApp});
                        //         })
                        amount = amountToPay;    
                    }else{
                        amount = "error in start location of bus";
                    }
        
                    }else{
                        amount = "Error in travelOption"
                    } 
                }else{
                    res.json({status:400,message:"Application invalid"});
                }
                // console.log(amount);
                // ===================================================================
                Profile.findOneAndUpdate(
                    // {email:req.body.email,'applications.currentApplication.applicationStatus':"Under Process"},
                    {email:req.body.email,'applications.allApplications.applicationStatus':"Under Process"},
                    // {email:req.body.email},
                    {$set:{'applications.currentApplication.applicationStatus':"Approved",'applications.currentApplication.amount':amount,'applications.allApplications.$.applicationStatus':"Approved",'applications.allApplications.$.amount':amount,'applications.allApplications.$.applicationAcceptedOn':Date().toString(),'applications.currentApplication.applicationAcceptedOn':Date().toString()}},
                    // {$set:{'applications.allApplications.$.applicationStatus':"calm"}},
                    {new: true}
                    ).then( async() => {
                        const currentApp = await Profile.findOne({email:req.body.email});
                        console.log(currentApp);
                        console.log(currentApp.nameAsPerIdCard);
                        var mailOptions = {
                            from: 'easypass24@gmail.com',
                            to: currentApp.email,
                            subject: 'Application Verification Done!',
                            text: `
                    Hi ${currentApp.nameAsPerIdCard.charAt(0).toUpperCase()+ currentApp.nameAsPerIdCard.slice(1)},
                            
                        Your Application Has Been Succesfully Verified & Accepted!.
                    
                    
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

                        const unapprovedProfiles = await Profile.find({'applications.currentApplication.applicationStatus':"Under Process"});
                        const approvedProfiles = await Profile.find({'applications.currentApplication.applicationStatus':"Approved"});
                        const userType = req.userInfo.type;
                        if(userType ==='college admin'){
                            let unapprovedApps = [];
                            for (let i = 0; i < unapprovedProfiles.length; i++) {
                            unapprovedApps.push(unapprovedProfiles[i].applications.currentApplication);
                        }
                        let approvedApps = [];
                        var promises = [];
                        for (let i = 0; i < approvedProfiles.length; i++) {
                            promises.push(
                                new Promise((resolve, reject) => {
                                    for(let j= 0; j<approvedProfiles[i].applications.allApplications.length; j++){
                                        if(approvedProfiles[i].applications.allApplications[j].applicationStatus=="Approved")
                                        approvedApps.push(approvedProfiles[i].applications.allApplications[j]);
                                        resolve()
                                    }
                                })
                            )
                        }
                        Promise.all(promises).then(() => {
                            return res.json({status:200,message:'Successfully Approved!', unapprovedApps,approvedApps});
                        })
                        //    res.json({status:'Successfully Verified!',unApprovedProfiles,approveddProfiles});
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

// Post Route For Admin to Reject New Application of Concession Letter **
export const adminRejectApp = async(req,res) => {
    try {
        Profile.findOne({email:req.body.email,collegeName:req.userInfo.collegeName}).then(profileToReject => {
            if (profileToReject) {
                // console.log(profileToReject)
                Profile.findOneAndUpdate(
                    {email:req.body.email,'applications.allApplications.applicationStatus':"Under Process"},
                    {$set:{'applications.currentApplication.applicationStatus':"Rejected",'applications.allApplications.$.applicationStatus':"Rejected",'applications.allApplications.$.applicationRejectedOn':Date().toString(),'applications.currentApplication.applicationRejectedOn':Date().toString()}},
                    {new: true}
                    ).then( async() => {
                        const currentApp = await Profile.findOne({email:req.body.email});
                        console.log(currentApp);
                        console.log(currentApp.nameAsPerIdCard);
                        var mailOptions = {
                            from: 'easypass24@gmail.com',
                            to: currentApp.email,
                            subject: 'Application Rejected!',
                            text: `
                    Hi ${currentApp.nameAsPerIdCard.charAt(0).toUpperCase()+ currentApp.nameAsPerIdCard.slice(1)},
                            
                        Your Application Has Been Rejected!.Please Edit It Or Create A New Application.
                    
                    
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

                        const unapprovedProfiles = await Profile.find({'applications.currentApplication.applicationStatus':"Under Process"});
                        const approvedProfiles = await Profile.find({'applications.currentApplication.applicationStatus':"Approved"});
                        const rejectedProfiles = await Profile.find({'applications.currentApplication.applicationStatus':"Rejected"});
                        const userType = req.userInfo.type;
                        if(userType ==='college admin'){
                            let unapprovedApps = [];
                            for (let i = 0; i < unapprovedProfiles.length; i++) {
                                unapprovedApps.push(unapprovedProfiles[i].applications.currentApplication);
                            }
                            // let rejectedApps = [];
                            // for (let i = 0; i < rejectedProfiles.length; i++) {
                                // rejectedApps.push(rejectedProfiles[i].applications.currentApplication);
                            // }
                            let approvedApps = [];
                            
                        var promises = [];
                        for (let i = 0; i < rejectedProfiles.length; i++) {
                            approvedApps.push(rejectedProfiles[i].applications.currentApplication);
                        }
                        for (let i = 0; i < approvedProfiles.length; i++) {
                            promises.push(
                                new Promise((resolve, reject) => {
                                    for(let j= 0; j<approvedProfiles[i].applications.allApplications.length; j++){
                                        if(approvedProfiles[i].applications.allApplications[j].applicationStatus=="Approved")
                                        approvedApps.push(approvedProfiles[i].applications.allApplications[j]);
                                        resolve()
                                    }
                                })
                            )
                        }
                        Promise.all(promises).then(() => {
                            return res.json({status:200,message:'Successfully Rejected!', unapprovedApps,approvedApps});
                        })
                        //    res.json({status:'Successfully Verified!',unApprovedProfiles,approveddProfiles});
                        }else{
                            res.json({error:'Need Admin Privilages To Access This Route.'});
                        }
                    })
                } else {
                res.json({ status:404,error:'There is no Application to be Approved or Rejected And/Or The profile is already verified And/Or Need Admin Privilages'});
            }
                   
        })
    } catch (error) {
        res.json({status:500, message:error});
    }
}

//POST Route to View User's full Profile (Hidden:Admins)
export const fullProfile = async (req,res) => {
    try{
        const profile = await Profile.findOne({email:req.body.email}).populate('user');
        if(!profile) return res.json({status:'400',message:'There is no profile for this user. Please Create one at `profile/create`'});
        res.json({status:200,profile});
    } catch(err){
        res.json({status:'500', error:'Server Error'});
    } 
}


// --------------------RAILWAY ADMIN ROUTE---------------------
export const railwayPases = async(req,res) => {
    try {
        const unapprovedRailProfiles = await Profile.find({'applications.currentApplication.travelOption':'Local / Train','applications.currentApplication.amountPaid':true,'applications.currentApplication.passGiven':false});
        const approvedRailProfiles = await Profile.find({'applications.currentApplication.travelOption':'Local / Train','applications.currentApplication.amountPaid':true,'applications.allApplications.passGiven':true});
        const userType = req.userInfo.type;
        console.log(unapprovedRailProfiles,approvedRailProfiles);
        if(userType === 'bus admin' || userType==='college admin' || userType==='train admin'){
            let unapprovedRailApps = [];
            for (let i = 0; i < unapprovedRailProfiles.length; i++) {
                unapprovedRailApps.push(unapprovedRailProfiles[i].applications.currentApplication);
            }
            let approvedRailApps = [];
            var promises = [];
            for (let i = 0; i < approvedRailProfiles.length; i++) {
                promises.push(
                    new Promise((resolve, reject) => {
                        for(let j= 0; j<approvedRailProfiles[i].applications.allApplications.length; j++){
                            if(approvedRailProfiles[i].applications.allApplications[j].passGiven==true)
                            // approvedRailApps.push(approvedRailProfiles[i].profilePic);
                            approvedRailApps.push(approvedRailProfiles[i].applications.allApplications[j]);
                            resolve()
                        }
                    })
                    )
                }
                Promise.all(promises).then(() => {
                    return res.json({status:200, unapprovedRailApps,approvedRailApps});
                })
        }else{
            res.json({erroMsg:'Need Admin Privilages To Access This Route.'});
        }
    } catch (error) {
        res.json({errorMsg:error});
    }
}


export const railwayPassApprove = async(req,res) => {
    try {
        Profile.findOne({'applications.currentApplication.travelOption':'Local / Train','applications.currentApplication.amountPaid':true,email:req.body.email,'applications.currentApplication.passGiven':false}).then(profileToVerify => {
            if (profileToVerify) {
                Profile.findOneAndUpdate(
                    {'applications.currentApplication.travelOption':'Local / Train','applications.currentApplication.amountPaid':true,'applications.currentApplication.passGiven':false,email:req.body.email},
                    {$set:{'applications.currentApplication.passGiven':true,'applications.currentApplication.passGivenDate':Date().toString(),'applications.allApplications.0.passGiven':true,'applications.allApplications.0.passGivenDate':Date().toString()}},
                    {new: true}
                    ).then( async profileToVerify => {
                        // ========================================================================================
                        // const passinfopro = await Profile.findOne({user:req.userId});
                        console.log(profileToVerify);
                        let passInfo = [];
                        passInfo.push(profileToVerify.applications.currentApplication);
                        console.log(passInfo);
                        const current = new Date();
                        const validity = passInfo[0].travelPassPeriod.charAt(0);
                        const val = Number(validity);
                        const date = new Date()
                        date.setMonth(date.getMonth() + val);      
                        let passfields = {};
                        passfields.passinfo = {};
                        if((date -  current)>=0){
                            passfields.passinfo.passStatus = "Active";
                        }else{
                            passfields.passinfo.passStatus = "Expired";
                        }
                        // console.log(passinfo);
                        console.log(passInfo);
                        passfields.passinfo.passValidity = passInfo[0].travelPassPeriod;
                        passfields.passinfo.profilePic = profileToVerify.profilePic;
                        passfields.passinfo.passType = passInfo[0].travelOption;
                        passfields.passinfo.passStartDate = passInfo[0].appliedOn;
                        passfields.passinfo.passGivenDate = Date().toString();
                        passfields.passinfo.passEndDate = date.toString();
                        passfields.passinfo.passRoute = passInfo[0].startLocation+" to " + passInfo[0].endLocation;
                        // console.log(passfields);
                        // res.json({status:200,resp:"COOL"});
                        if (profileToVerify.applications.currentApplication.passGiven == true) {
                            console.log("ruunni")
                            Profile.findOne({email:req.body.email}).then(profilee => {
                                console.log("haa ha:- "+profilee);
                                if(profilee){
                                    Profile.findOneAndUpdate(
                                    {email: req.body.email},
                                    {$set: passfields},
                                    {new: true}
                                    ).then( async() => {

                                        // }else{
                                            // Create
                                            // res.json({status:400,Message:"Please Create a Profile First"});
                                            // new Profile(profileFields).save().then(profilee => res.json({status:200,profilee}));
                                            
                                            
                                            console.log("Not in IF");
                        // ========================================================================================
                        const unapprovedRailProfiles = await Profile.find({'applications.currentApplication.travelOption':'Local / Train','applications.currentApplication.amountPaid':true,'applications.currentApplication.passGiven':false});
                        const approvedRailProfiles = await Profile.find({'applications.currentApplication.travelOption':'Local / Train','applications.currentApplication.amountPaid':true,'applications.allApplications.passGiven':true});
                        const userType = req.userInfo.type;
                        if(userType === 'bus admin' || userType==='college admin' || userType==='railway admin'){
                            let unapprovedRailApps = [];
                            for (let i = 0; i < unapprovedRailProfiles.length; i++) {
                                unapprovedRailApps.push(unapprovedRailProfiles[i].applications.currentApplication);
                            }
                            let approvedRailApps = [];
                            var promises = [];
                            for (let i = 0; i < approvedRailProfiles.length; i++) {
                                promises.push(
                                    new Promise((resolve, reject) => {
                                        for(let j= 0; j<approvedRailProfiles[i].applications.allApplications.length; j++){
                                            if(approvedRailProfiles[i].applications.allApplications[j].passGiven==true)
                                            // approvedRailApps.push(approvedRailProfiles[i].profilePic);
                                            approvedRailApps.push(approvedRailProfiles[i].applications.allApplications[j]);
                                            resolve()
                                        }
                                    })
                                    )
                                }
                                Promise.all(promises).then(() => {
                                    return res.json({status:200, unapprovedRailApps,approvedRailApps});
                                })
                            }else{
                                res.json({erroMsg:'Need Admin Privilages To Access This Route.'});
                            }
                            
                        })}else{
                            res.json({status:400,message:"No matching Application found / The Applicaion is already approved!"});
                        }
                    })
                    }    
        });
        }else{
            res.json({status:400,Message:"No Profile Found!"});
        }
                    })

} catch (error) {
        res.json({status:500, Message:error});
    }

}


// --------------------BUS ADMIN ROUTE---------------------
export const busPases = async(req,res) => {
    try {
        const unapprovedBusProfiles = await Profile.find({'applications.currentApplication.travelOption':'PMPML / Bus','applications.currentApplication.passGiven':false,'applications.currentApplication.amountPaid':true});
        const approvedBusProfiles = await Profile.find({'applications.currentApplication.travelOption':'PMPML / Bus','applications.allApplications.passGiven':true,'applications.currentApplication.amountPaid':true});
        const userType = req.userInfo.type;
        console.log(unapprovedBusProfiles,approvedBusProfiles)
        if(userType === 'bus admin' || userType==='college admin' || userType==='railway admin'){
            let unapprovedBusApps = [];
            for (let i = 0; i < unapprovedBusProfiles.length; i++) {
                unapprovedBusApps.push(unapprovedBusProfiles[i].applications.currentApplication);
            }
            let approvedBusApps = [];
            var promises = [];
            for (let i = 0; i < approvedBusProfiles.length; i++) {
                promises.push(
                    new Promise((resolve, reject) => {
                        for(let j= 0; j<approvedBusProfiles[i].applications.allApplications.length; j++){
                            if(approvedBusProfiles[i].applications.allApplications[j].amountPaid==true && approvedBusProfiles[i].applications.allApplications[j].passGiven==true)
                            approvedBusApps.push(approvedBusProfiles[i].applications.allApplications[j]);
                            resolve()
                        }
                    })
                    )
                }
                Promise.all(promises).then(() => {
                    return res.json({status:200, unapprovedBusApps,approvedBusApps});
                })
        }else{
            res.json({erroMsg:'Need Admin Privilages To Access This Route.'});
        }
    } catch (error) {
        res.json({errorMsg:error});
    }
}

export const busPassApprove = async(req,res) => {
    try {
        Profile.findOne({'applications.currentApplication.travelOption':'PMPML / Bus','applications.currentApplication.amountPaid':true,email:req.body.email,'applications.currentApplication.passGiven':false}).then(profileToVerify => {
            // console.log(req.userInfo.collegeName);
            if (profileToVerify) {
                Profile.findOneAndUpdate(
                    {'applications.currentApplication.amountPaid':true,'applications.currentApplication.travelOption':'PMPML / Bus','applications.currentApplication.passGiven':false,email:req.body.email},
                    {$set:{'applications.currentApplication.passGiven':true,'applications.currentApplication.passGivenDate':Date().toString(),'applications.allApplications.0.passGiven':true,'applications.allApplications.0.passGivenDate':Date().toString()}},
                    {new: true}
                    ).then( async profileToVerify => {
                        // ========================================================================================
                        // const passinfopro = await Profile.findOne({user:req.userId});
                        console.log(profileToVerify);
                        let passInfo = [];
                        passInfo.push(profileToVerify.applications.currentApplication);
                        console.log(passInfo);
                        const current = new Date();
                        const validity = passInfo[0].travelPassPeriod.charAt(0);
                        const val = Number(validity);
                        const date = new Date()
                        date.setMonth(date.getMonth() + val);      
                        let passfields = {};
                        passfields.passinfo = {};
                        if((date -  current)>=0){
                            passfields.passinfo.passStatus = "Active";
                        }else{
                            passfields.passinfo.passStatus = "Expired";
                        }
                        // console.log(passinfo);
                        console.log(passInfo);
                        passfields.passinfo.passValidity = passInfo[0].travelPassPeriod;
                        passfields.passinfo.profilePic = profileToVerify.profilePic;
                        passfields.passinfo.passType = passInfo[0].travelOption;
                        passfields.passinfo.passStartDate = passInfo[0].appliedOn;
                        passfields.passinfo.passGivenDate = Date().toString();
                        passfields.passinfo.passEndDate = date.toString();
                        passfields.passinfo.passRoute = passInfo[0].startLocation+" to " + passInfo[0].endLocation;
                        // console.log(passfields);
                        // res.json({status:200,resp:"COOL"});
                        if (profileToVerify.applications.currentApplication.passGiven == true) {
                            console.log("ruunni")
                            Profile.findOne({email:req.body.email}).then(profilee => {
                                console.log("haa ha:- "+profilee);
                                if(profilee){
                                    Profile.findOneAndUpdate(
                                    {email: req.body.email},
                                    {$set: passfields},
                                    {new: true}
                                    ).then( async() => {

                                        // }else{
                                            // Create
                                            // res.json({status:400,Message:"Please Create a Profile First"});
                                            // new Profile(profileFields).save().then(profilee => res.json({status:200,profilee}));
                                            
                                            
                                            console.log("Not in IF");
                        // ========================================================================================
                        const unapprovedBusProfiles = await Profile.find({'applications.currentApplication.travelOption':'PMPML / Bus','applications.currentApplication.amountPaid':true,'applications.currentApplication.passGiven':false});
                        const approvedBusProfiles = await Profile.find({'applications.currentApplication.travelOption':'PMPML / Bus','applications.currentApplication.amountPaid':true,'applications.allApplications.passGiven':true});
                        const userType = req.userInfo.type;
                        if(userType === 'bus admin' || userType==='college admin' || userType==='railway admin'){
                            let unapprovedBusApps = [];
                            for (let i = 0; i < unapprovedBusProfiles.length; i++) {
                                unapprovedBusApps.push(unapprovedBusProfiles[i].applications.currentApplication);
                            }
                            let approvedBusApps = [];
                            var promises = [];
                            for (let i = 0; i < approvedBusProfiles.length; i++) {
                                promises.push(
                                    new Promise((resolve, reject) => {
                                        for(let j= 0; j<approvedBusProfiles[i].applications.allApplications.length; j++){
                                            if(approvedBusProfiles[i].applications.allApplications[j].amountPaid==true && approvedBusProfiles[i].applications.allApplications[j].passGiven==true)
                                            // approvedBusApps.push(approvedBusProfiles[i].profilePic);
                                            approvedBusApps.push(approvedBusProfiles[i].applications.allApplications[j]);
                                            resolve()
                                        }
                                    })
                                    )
                                }
                                Promise.all(promises).then(() => {
                                    return res.json({status:200, unapprovedBusApps,approvedBusApps});
                                })
                        }else{
                            res.json({erroMsg:'Need Admin Privilages To Access This Route.'});
                        }
                        
                    })}else{
                        res.json({status:400,message:"No matching Application found / The Applicaion is already approved!"});
                    }
                })
                }    
    });
    }else{
            res.json({status:400,Message:"No Profile Found!"});
    }
                })
            } catch (error) {
                res.json({status:500, Message:error});
            }
    }




//Download Concession Letter for Approved User Profiles
export const pdfGen = async (req, res) => {
    try {
        
        const userprofile = await Profile.findOne({user:req.userId}).populate('user',['name','type']);
        if (userprofile) {
            if (userprofile.applications.currentApplication.applicationStatus === 'Under Process') {
                res.json({status:400,message:'Please Wait Until Your Application is Approved!'})
            } else {
                const buildPDF = (datacallback, endcallback) => {
                    const doc = new PDFDocument({size: 'A4'});
                doc.on('data',datacallback);
                doc.on('end',endcallback);
                doc.image('logo.png', 50, 60, { width: 50 })
                doc.lineWidth(6);
                doc.lineCap('butt').moveTo(40, 20).lineTo(563, 20).stroke();
                doc.lineCap('butt').moveTo(43, 20).lineTo(40, 820).stroke();
                doc.lineCap('butt').moveTo(560, 20).lineTo(560, 820).stroke();
            doc.lineCap('butt').moveTo(42, 817).lineTo(560, 817).stroke();
            doc.font('IBMPlexSansThaiLooped-Bold.ttf').fontSize(60).fillColor('cyan').text(`${userprofile.nameAsPerIdCard}`,115,40);
            doc.fontSize(55).fillColor('#a3232').text(`From: `,65,140,{continued:true}).fillColor('#6ceffd').text(`${userprofile.applications.currentApplication.startLocation.toUpperCase()} `,{continued:true}).fillColor('#a3232').text(`To: `,{continued:true}).fillColor('#3e7fc').text(`${userprofile.applications.currentApplication.endLocation.toUpperCase()}`);
            doc.fontSize(45).fillColor('black').text(`Via:- `,65,340,{continued:true}).fillColor('#a3232').text(`${userprofile.applications.currentApplication.travelOption.toUpperCase()}`);
            doc.fontSize(35).fillColor('#261820').text(`Valid From:- ${userprofile.applications.currentApplication.applicationAcceptedOn.slice(4,16)}`,65,440);
            doc.fontSize(35).fillColor('#261820').text(`Valid For:- Next 3 Days`,65,500);
            doc.fontSize(25).fillColor('#a3232').text(`College:- ${userprofile.collegeName.toUpperCase()}`,65,590);
            doc.fontSize(25).fillColor('#a3232').text(`Date Of Birth:- ${userprofile.dateOfBirth}`,65,650);
            doc.fontSize(25).fillColor('#261820').text(`   `,65,680);
            doc.fontSize(25).fillColor('#261820').text(`   `,65,685);
            doc.fontSize(25).fillColor('#426484').text(`${userprofile.email}`,{align:'right'});
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
        }
    } else {
        res.json({status:404,resp:"Please Create a Profile!"})    
    }
    } catch (error) {
        res.json({status:400,msg:"Whoopsie"});
    }
};




  // const origin = profile.applications.currentApplication.startLocation;
        // if(origin){

        //     // const dest = profile.applications.currentApplication.endLocation;
        //     const period = profile.applications.currentApplication.travelPassPeriod.toLowerCase();
            
        //     const via = profile.applications.currentApplication.travelOption;
        //     // console.log(dest,origin); 
        //     // console.log(profile); 
        //     if(via == "Local / Train"){
                
        //         let amountToPay; 
        //         if (origin == 'Ghorawadi' || origin == 'Begdewadi' || origin =='Dehu Road' || origin == 'Vadgaon') {
        //             if (period == '1 month'){
        //             amountToPay = '60'
        //         }else if(period == '3 months'){
        //             amountToPay = '160';
        //         }else if(period == '6 months'){
        //             amountToPay = '280';
        //         }    
        //         Profile.findOneAndUpdate(
        //             {email:req.userInfo.email,'applications.currentApplication.applicationStatus':"Approved"},
        //             {$set: {'applications.currentApplication.amount':amountToPay, 'applications.allApplications.0.amount':amountToPay}},
        //             {new: true}).then(
        //                 async() => {
        //                     const myApp = await Profile.findOne({email:req.userInfo.email}).populate('user');
        //                     res.json({status:200,myApp});
        //                 })
        //     }else if(origin == 'Akurdi' || origin == 'Chinchwad' || origin =='Pimpri' || origin == 'Kamshet' || origin == 'Kanhe') {
        //         // let amountToPay; 
        //         if (period == '1 month'){
        //             amountToPay = '90'
        //         }else if(period == '3 months'){
        //             amountToPay = '210';
        //         }else if(period == '6 months'){
        //             amountToPay = '380';
        //         }    
        //         Profile.findOneAndUpdate(
        //             {email:req.userInfo.email,'applications.currentApplication.applicationStatus':"Approved"},
        //             {$set: {'applications.currentApplication.amount':amountToPay, 'applications.allApplications.0.amount':amountToPay}},
        //             {new: true}).then(
        //                 async() => {
        //                     const myApp = await Profile.findOne({email:req.userInfo.email}).populate('user');
        //                     res.json({status:200,myApp});
        //                 })
        //     }else if(origin == 'Kasarwadi' || origin == 'Dapodi' || origin == 'khadki' || origin == 'Malavli') {
        //         // let amountToPay; 
        //         if (period == '1 month'){
        //             amountToPay = '130'
        //         }else if(period == '3 months'){
        //             amountToPay = '245';
        //         }else if(period == '6 months'){
        //             amountToPay = '480';
        //         }     
        //         Profile.findOneAndUpdate(
        //             {email:req.userInfo.email,'applications.currentApplication.applicationStatus':"Approved"},
        //             {$set: {'applications.currentApplication.amount':amountToPay, 'applications.allApplications.0.amount':amountToPay}},
        //             {new: true}).then(
        //                 async() => {
        //                     const myApp = await Profile.findOne({email:req.userInfo.email}).populate('user');
        //                     res.json({status:200,myApp});
        //                 })
        //     }else if(origin == 'Pune' || origin == 'Shivajinagar' || origin =='Lonawala') {
        //         // let amountToPay; 
        //         if (period == '1 month'){
        //             amountToPay = '160'
        //         }else if(period == '3 months'){
        //             amountToPay = '320';
        //         }else if(period == '6 months'){
        //             amountToPay = '515';
        //         }  
        //         Profile.findOneAndUpdate(
        //             {email:req.userInfo.email,'applications.currentApplication.applicationStatus':"Approved"},
        //             {$set: {'applications.currentApplication.amount':amountToPay, 'applications.allApplications.0.amount':amountToPay}},
        //             {new: true}).then(
        //                 async() => {
        //                     const myApp = await Profile.findOne({email:req.userInfo.email}).populate('user');
        //                     res.json({status:200,myApp});
        //                 })
        //     }else{
        //         res.json({status:200,profile});
        //     }
        //     }else if(via == "PMPML / Bus"){
        //     let amountToPay; 
        //     if (origin == 'Ghorawadi' || origin == 'Begdewadi' || origin =='Dehu Road' || origin == 'Vadgaon') {
        //         if (period == '1 month'){
        //             amountToPay = '90'
        //         }else if(period == '3 months'){
        //             amountToPay = '180';
        //         }else if(period == '6 months'){
        //             amountToPay = '300';
        //         }    
        //         Profile.findOneAndUpdate(
        //             {email:req.userInfo.email,'applications.currentApplication.applicationStatus':"Approved"},
        //             {$set: {'applications.currentApplication.amount':amountToPay, 'applications.allApplications.0.amount':amountToPay}},
        //             {new: true}).then(
        //                 async() => {
        //                     const myApp = await Profile.findOne({email:req.userInfo.email}).populate('user');
        //                     res.json({status:200,myApp});
        //                 })
        //     }else if(origin == 'Akurdi' || origin == 'Chinchwad' || origin =='Pimpri' || origin == 'Kamshet' || origin == 'Kanhe') {
        //         // let amountToPay; 
        //         if (period == '1 month'){
        //             amountToPay = '110'
        //         }else if(period == '3 months'){
        //             amountToPay = '230';
        //         }else if(period == '6 months'){
        //             amountToPay = '400';
        //         }    
        //         Profile.findOneAndUpdate(
        //             {email:req.userInfo.email,'applications.currentApplication.applicationStatus':"Approved"},
        //             {$set: {'applications.currentApplication.amount':amountToPay, 'applications.allApplications.0.amount':amountToPay}},
        //             {new: true}).then(
        //                 async() => {
        //                     const myApp = await Profile.findOne({email:req.userInfo.email}).populate('user');
        //                     res.json({status:200,myApp});
        //                 })
        //     }else if(origin == 'Kasarwadi' || origin == 'Dapodi' || origin == 'khadki' || origin == 'Malavli') {
        //         // let amountToPay; 
        //         if (period == '1 month'){
        //             amountToPay = '150'
        //         }else if(period == '3 months'){
        //             amountToPay = '265';
        //         }else if(period == '6 months'){
        //             amountToPay = '500';
        //         }     
        //         Profile.findOneAndUpdate(
        //             {email:req.userInfo.email,'applications.currentApplication.applicationStatus':"Approved"},
        //             {$set: {'applications.currentApplication.amount':amountToPay, 'applications.allApplications.0.amount':amountToPay}},
        //             {new: true}).then(
        //                 async() => {
        //                     const myApp = await Profile.findOne({email:req.userInfo.email}).populate('user');
        //                     res.json({status:200,myApp});
        //                 })
        //     }else if(origin == 'Pune' || origin == 'Shivajinagar' || origin =='Lonawala') {
        //         // let amountToPay; 
        //         if (period == '1 month'){
        //             amountToPay = '180'
        //         }else if(period == '3 months'){
        //             amountToPay = '340';
        //         }else if(period == '6 months'){
        //             amountToPay = '535';
        //         }  
        //         Profile.findOneAndUpdate(
        //             {email:req.userInfo.email,'applications.currentApplication.applicationStatus':"Approved"},
        //             {$set: {'applications.currentApplication.amount':amountToPay, 'applications.allApplications.0.amount':amountToPay}},
        //             {new: true}).then(
        //                 async() => {
        //                     const myApp = await Profile.findOne({email:req.userInfo.email}).populate('user');
        //                     res.json({status:200,myApp});
        //                 })
        //     }else{
        //         res.json({status:200,profile});
        //     }

        //     }else{
        //         res.json({status:200,profile});
        //     } 
        // }else{
        //     res.json({status:200,profile});
        // }


