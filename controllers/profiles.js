import Profile from '../models/profile.js';
import PDFDocument from "pdfkit";
import cloudinary from '../utils/cloudinary.js'
import Applications from '../models/applications.js';
import User from '../models/user.js';


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
                ).then(profilee => res.json({status:200, profilee,message:'Profile successfully sent for verification'}));
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
        const profile = await Profile.findOne({email:req.userInfo.email}).populate('user');
        console.log(req.userInfo);
        // console.log(profile);
        if(!profile) return res.json({status:'400',message:'There is no profile for this user. Please Create one at `profile/create`'});
        res.json({status:200,profile});
    } catch(err){
        res.json({status:'500', error:'Server Error', errorr:err});
    } 
}

//Create New Application For Concession Letter
export const newApplication = async(req,res) => {
    try {
        const applicationFields = {};
        applicationFields.applications = {};    
        applicationFields.profile=req.userInfo.profileId;
        applicationFields.email=req.userInfo.email;
        applicationFields.collegeName=req.userInfo.collegeName;
        const {travelOption,startLocation,endLocation,travelPassPeriod} = req.body;
        const result = await cloudinary.uploader.upload(req.file.path);
        if(travelOption)  applicationFields.applications.travelOption = travelOption;
        if(startLocation) applicationFields.applications.startLocation = startLocation;
        if(endLocation) applicationFields.applications.endLocation = endLocation;
        applicationFields.applications.applicationStatus = 'Under Process';
        applicationFields.applications.addressProof=result.secure_url;
        if(travelPassPeriod) applicationFields.applications.travelPassPeriod = travelPassPeriod;
        applicationFields.applications.appliedOn=Date().toString();
        
        Applications.findOne({profile:req.userInfo.profileId,email:req.userInfo.email}).then( async application => {  
            const newApp = {
                // profile:req.userInfo.profileId,
                travelOption:travelOption,
                startLocation:startLocation,
                endLocation:endLocation,
                travelPassPeriod:travelPassPeriod,
                applicationStatus:"Under Process",
                addressProof:result.secure_url,
                appliedOn:Date().toString()
            };
            if(application){
                // Create New Application
                application.applications.unshift(newApp);
                application.save().then(async application => {
                    const applicationn = await Applications.findOne({profile:req.userInfo.profileId,email:req.userInfo.email});
                    res.json({status:200,applicationn});
                }
                );
            }else{
                if (req.userInfo.collegeName === req.userInfo.profileId) {
                        res.json({status:401,message:"Please Re-Login & Try Again."});
                    } else {    
                        // create First Application
                        new Applications(applicationFields).save().then(async application => {
                        const applicationn = await Applications.findOne({profile:req.userInfo.profileId,email:req.userInfo.email});
                        res.json({status:200,applicationn});
                    })
                }        
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
        const profile = await Applications.findOne({email:req.userInfo.email});
        if(!profile) return res.json({status:'400',message:'There is no profile for this user. Please Create one at `profile/create`'});
        res.json({status:200,profile});
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


// Get Route for collegeAdmin To View Only UnApproved Applications **
export const adminUnApprovedProfiles = async(req,res) => {
    try {
        const unApprovedApplications = await Applications.find({collegeName:req.userInfo.collegeName,'applications.0.applicationStatus':'Under Process'});
        const userType = req.userInfo.type;
        if(userType ==='college admin'){
            return res.json({status:200 , unApprovedApplications});
        }else{
            res.json({status:400,erroMsg:'Need Admin Privilages To Access This Route.'});
        }
    } catch (error) {
        res.json({errorMsg:error});
    }
}

//Get Route For Admin To View All Applications 
export const adminGetApp = async(req,res) => {
    try {
        const allApplications = await Applications.find({collegeName:req.userInfo.collegeName});
        const userType = req.userInfo.type;
        // console.log(req.userInfo.collegeName);
        // console.log(unapprovedProfiles);
        if(userType ==='college admin'){
            // return res.json({status:200, unapprovedProfiles,approveddProfiles});
            return res.json({status:200, allApplications});
        }else{
            res.json({erroMsg:'Need Admin Privilages To Access This Route.'});
        }
    } catch (error) {
        res.json({errorMsg:error});
    }
}

// Post Route For Admin to Approve New Application of Concession Letter **
export const adminApproveApp = async(req,res) => {
    try {
        Applications.findOne({email:req.body.email,collegeName:req.userInfo.collegeName}).then(profileToApproove => {
            if (profileToApproove) {
                // console.log(profileToApproove)
                Applications.findOneAndUpdate(
                    {email:req.body.email,'applications.applicationStatus':"Under Process"},
                    {$set:{'applications.0.applicationStatus':"Approved",'applications.0.applicationAcceptedOn':Date().toString()}},
                    {new: true}
                    ).then( async() => {
                        const allApplications = await Applications.find({collegeName:req.userInfo.collegeName});
                        const userType = req.userInfo.type;
                        if(userType ==='college admin'){
                           res.json({status:'Successfully Approved!',allApplications});
                        }else{
                            res.json({error:'Need Admin Privilages To Access This Route.'});
                        }
                    })
                } else {
                res.json({ status:404,error:'There is no Profile to be verified And/Or The profile is already verified And/Or Need Admin Privilages'});
            }
                   
        })
    } catch (error) {
        res.json({status:500, message:error});
    }
}

// Post Route For Admin to Reject New Application of Concession Letter **
export const adminRejectApp = async(req,res) => {
    try {
        Applications.findOne({email:req.body.email,collegeName:req.userInfo.collegeName}).then(profileToReject => {
            if (profileToReject) {
                // console.log(profileToReject)
                Applications.findOneAndUpdate(
                    {email:req.body.email,'applications.applicationStatus':"Under Process"},
                    {$set:{'applications.$.applicationStatus':"Rejected"}},
                    {new: true}
                    ).then( async() => {
                        const allApplications = await Applications.find({collegeName:req.userInfo.collegeName});
                        const userType = req.userInfo.type;
                        if(userType ==='college admin'){
                           res.json({status:'Application Successfully Rejected!',allApplications});
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
        const profile = await Applications.findOne({email:req.body.email}).populate('profile');
        if(!profile) return res.json({status:'400',message:'There is no profile for this user. Please Create one at `profile/create`'});
        res.json({status:200,profile});
    } catch(err){
        res.json({status:'500', error:'Server Error'});
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






