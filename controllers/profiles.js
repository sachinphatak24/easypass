import Profile from '../models/profile.js';
import PDFDocument from "pdfkit";
import cloudinary from '../utils/cloudinary.js'
import User from '../models/user.js';

// import Razorpay from 'razorpay'; 

// ==========================
// export const paymentRoute = async(req,res)=>{

// }


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
        const profile = await Profile.findOne({user:req.userId}).populate('user');
        if(!profile) return res.json({status:'400',message:'There is no profile for this user. Please Create one at `profile/create`'});
        // res.json({status:200,profile});
        const origin = profile.applications.currentApplication.startLocation; 
        // const dest = profile.applications.currentApplication.endLocation;
        const period = profile.applications.currentApplication.travelPassPeriod.toLowerCase();

        const via = profile.applications.currentApplication.travelOption;

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
                Profile.findOneAndUpdate(
                    {email:req.userInfo.email,'applications.currentApplication.applicationStatus':"Approved"},
                    {$set: {'applications.currentApplication.amount':amountToPay, 'applications.allApplications.0.amount':amountToPay}},
                    {new: true}).then(
                        async() => {
                            const myApp = await Profile.findOne({email:req.userInfo.email}).populate('user');
                            res.json({status:201,myApp});
                        })
            }else if(origin == 'Akurdi' || origin == 'Chinchwad' || origin =='Pimpri' || origin == 'Kamshet' || origin == 'Kanhe') {
                // let amountToPay; 
                if (period == '1 month'){
                    amountToPay = '90'
                }else if(period == '3 months'){
                    amountToPay = '210';
                }else if(period == '6 months'){
                    amountToPay = '380';
                }    
                Profile.findOneAndUpdate(
                    {email:req.userInfo.email,'applications.currentApplication.applicationStatus':"Approved"},
                    {$set: {'applications.currentApplication.amount':amountToPay, 'applications.allApplications.0.amount':amountToPay}},
                    {new: true}).then(
                        async() => {
                            const myApp = await Profile.findOne({email:req.userInfo.email}).populate('user');
                            res.json({status:201,myApp});
                        })
            }else if(origin == 'Kasarwadi' || origin == 'Dapodi' || origin == 'khadki' || origin == 'Malavli') {
                // let amountToPay; 
                if (period == '1 month'){
                    amountToPay = '130'
                }else if(period == '3 months'){
                    amountToPay = '245';
                }else if(period == '6 months'){
                    amountToPay = '480';
                }     
                Profile.findOneAndUpdate(
                    {email:req.userInfo.email,'applications.currentApplication.applicationStatus':"Approved"},
                    {$set: {'applications.currentApplication.amount':amountToPay, 'applications.allApplications.0.amount':amountToPay}},
                    {new: true}).then(
                        async() => {
                            const myApp = await Profile.findOne({email:req.userInfo.email}).populate('user');
                            res.json({status:201,myApp});
                        })
            }else if(origin == 'Pune' || origin == 'Shivajinagar' || origin =='Lonawala') {
                // let amountToPay; 
                if (period == '1 month'){
                    amountToPay = '160'
                }else if(period == '3 months'){
                    amountToPay = '320';
                }else if(period == '6 months'){
                    amountToPay = '515';
                }  
                Profile.findOneAndUpdate(
                    {email:req.userInfo.email,'applications.currentApplication.applicationStatus':"Approved"},
                    {$set: {'applications.currentApplication.amount':amountToPay, 'applications.allApplications.0.amount':amountToPay}},
                    {new: true}).then(
                        async() => {
                            const myApp = await Profile.findOne({email:req.userInfo.email}).populate('user');
                            res.json({status:201,myApp});
                        })
            }else{
                res.json({status:200,profile});
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
                Profile.findOneAndUpdate(
                    {email:req.userInfo.email,'applications.currentApplication.applicationStatus':"Approved"},
                    {$set: {'applications.currentApplication.amount':amountToPay, 'applications.allApplications.0.amount':amountToPay}},
                    {new: true}).then(
                        async() => {
                            const myApp = await Profile.findOne({email:req.userInfo.email}).populate('user');
                            res.json({status:201,myApp});
                        })
            }else if(origin == 'Akurdi' || origin == 'Chinchwad' || origin =='Pimpri' || origin == 'Kamshet' || origin == 'Kanhe') {
                // let amountToPay; 
                if (period == '1 month'){
                    amountToPay = '110'
                }else if(period == '3 months'){
                    amountToPay = '230';
                }else if(period == '6 months'){
                    amountToPay = '400';
                }    
                Profile.findOneAndUpdate(
                    {email:req.userInfo.email,'applications.currentApplication.applicationStatus':"Approved"},
                    {$set: {'applications.currentApplication.amount':amountToPay, 'applications.allApplications.0.amount':amountToPay}},
                    {new: true}).then(
                        async() => {
                            const myApp = await Profile.findOne({email:req.userInfo.email}).populate('user');
                            res.json({status:201,myApp});
                        })
            }else if(origin == 'Kasarwadi' || origin == 'Dapodi' || origin == 'khadki' || origin == 'Malavli') {
                // let amountToPay; 
                if (period == '1 month'){
                    amountToPay = '150'
                }else if(period == '3 months'){
                    amountToPay = '265';
                }else if(period == '6 months'){
                    amountToPay = '500';
                }     
                Profile.findOneAndUpdate(
                    {email:req.userInfo.email,'applications.currentApplication.applicationStatus':"Approved"},
                    {$set: {'applications.currentApplication.amount':amountToPay, 'applications.allApplications.0.amount':amountToPay}},
                    {new: true}).then(
                        async() => {
                            const myApp = await Profile.findOne({email:req.userInfo.email}).populate('user');
                            res.json({status:201,myApp});
                        })
            }else if(origin == 'Pune' || origin == 'Shivajinagar' || origin =='Lonawala') {
                // let amountToPay; 
                if (period == '1 month'){
                    amountToPay = '180'
                }else if(period == '3 months'){
                    amountToPay = '340';
                }else if(period == '6 months'){
                    amountToPay = '535';
                }  
                Profile.findOneAndUpdate(
                    {email:req.userInfo.email,'applications.currentApplication.applicationStatus':"Approved"},
                    {$set: {'applications.currentApplication.amount':amountToPay, 'applications.allApplications.0.amount':amountToPay}},
                    {new: true}).then(
                        async() => {
                            const myApp = await Profile.findOne({email:req.userInfo.email}).populate('user');
                            res.json({status:201,myApp});
                        })
            }else{
                res.json({status:200,profile});
            }

        }else{
            res.json({status:200,profile});
        }
    } catch(err){
        res.json({status:'500', error:'Server Error'});
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

        applicationFields.applications.currentApplication.applicationStatus = 'Under Process';
        applicationFields.applications.currentApplication.addressProof=result.secure_url;
        if(travelPassPeriod) applicationFields.applications.currentApplication.travelPassPeriod = travelPassPeriod;
        applicationFields.applications.currentApplication.appliedOn=Date().toString();

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
                appliedOn:Date().toString(),


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
        const origin = profile.applications.currentApplication.startLocation; 
        // const dest = profile.applications.currentApplication.endLocation;
        const period = profile.applications.currentApplication.travelPassPeriod;
        // console.log(dest,origin); 
        // console.log(profile); 
        let amountToPay; 
        if (origin == 'Ghorawadi' || origin == 'Begdewadi' || origin =='Dehu Road' || origin == 'Vadgaon') {
            if (period == '1 month'){
                amountToPay = '60'
            }else if(period == '3 months'){
                amountToPay = '160';
            }else if(period == '6 months'){
                amountToPay = '280';
            }    
            Profile.findOneAndUpdate(
                {email:req.userInfo.email,'applications.currentApplication.applicationStatus':"Approved"},
                {$set: {'applications.currentApplication.amount':amountToPay, 'applications.allApplications.0.amount':amountToPay}},
                {new: true}).then(
                    async() => {
                        const myApp = await Profile.findOne({email:req.userInfo.email}).populate('user');
                        res.json({status:201,myApp});
                    })
        }else if(origin == 'Akurdi' || origin == 'Chinchwad' || origin =='Pimpri' || origin == 'Kamshet' || origin == 'Kanhe') {
            // let amountToPay; 
            if (period == '1 month'){
                amountToPay = '90'
            }else if(period == '3 months'){
                amountToPay = '210';
            }else if(period == '6 months'){
                amountToPay = '380';
            }    
            Profile.findOneAndUpdate(
                {email:req.userInfo.email,'applications.currentApplication.applicationStatus':"Approved"},
                {$set: {'applications.currentApplication.amount':amountToPay, 'applications.allApplications.0.amount':amountToPay}},
                {new: true}).then(
                    async() => {
                        const myApp = await Profile.findOne({email:req.userInfo.email}).populate('user');
                        res.json({status:201,myApp});
                    })
        }else if(origin == 'Kasarwasi' || origin == 'Dapodi' || origin == 'khadki' || origin == 'Malavli') {
            // let amountToPay; 
            if (period == '1 month'){
                amountToPay = '130'
            }else if(period == '3 months'){
                amountToPay = '245';
            }else if(period == '6 months'){
                amountToPay = '480';
            }     
            Profile.findOneAndUpdate(
                {email:req.userInfo.email,'applications.currentApplication.applicationStatus':"Approved"},
                {$set: {'applications.currentApplication.amount':amountToPay, 'applications.allApplications.0.amount':amountToPay}},
                {new: true}).then(
                    async() => {
                        const myApp = await Profile.findOne({email:req.userInfo.email}).populate('user');
                        res.json({status:201,myApp});
                    })
        }else if(origin == 'Pune' || origin == 'Shivajinagar' || origin =='Lonawala') {
            // let amountToPay; 
            if (period == '1 month'){
                amountToPay = '160'
            }else if(period == '3 months'){
                amountToPay = '320';
            }else if(period == '6 months'){
                amountToPay = '515';
            }  
            Profile.findOneAndUpdate(
                {email:req.userInfo.email,'applications.currentApplication.applicationStatus':"Approved"},
                {$set: {'applications.currentApplication.amount':amountToPay, 'applications.allApplications.0.amount':amountToPay}},
                {new: true}).then(
                    async() => {
                        const myApp = await Profile.findOne({email:req.userInfo.email}).populate('user');
                        res.json({status:201,myApp});
                    })
        }else{
            res.json({status:200,profile});
        }

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
export const adminApproveApp = async(req,res) => {
    try {
        Profile.findOne({profileVerifyApplied:true,email:req.body.email,collegeName:req.userInfo.collegeName,profileVerifystatus:'Verified','applications.currentApplication.applicationStatus':'Under Process'}).then(profileToApproove => {
            if (profileToApproove) {
                // return res.json(profileToApproove.applications.allApplications[0].applicationStatus);
                Profile.findOneAndUpdate(
                    // {email:req.body.email,'applications.currentApplication.applicationStatus':"Under Process"},
                    {email:req.body.email,'applications.allApplications.applicationStatus':"Under Process"},
                    // {email:req.body.email},
                    {$set:{'applications.currentApplication.applicationStatus':"Approved",'applications.allApplications.$.applicationStatus':"Approved",'applications.allApplications.$.applicationAcceptedOn':Date().toString(),'applications.currentApplication.applicationAcceptedOn':Date().toString()}},
                    // {$set:{'applications.allApplications.$.applicationStatus':"calm"}},
                    {new: true}
                    ).then( async() => {
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
        const unapprovedRailProfiles = await Profile.find({'applications.currentApplication.travelOption':'Local / Train','applications.currentApplication.applicationStatus':'Under Process'});
        const approvedRailProfiles = await Profile.find({'applications.currentApplication.travelOption':'Local / Train','applications.allApplications.applicationStatus':'Approved'});
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
                            if(approvedRailProfiles[i].applications.allApplications[j].applicationStatus=="Approved")
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



// --------------------BUS ADMIN ROUTE---------------------
export const busPases = async(req,res) => {
    try {
        const unapprovedBusProfiles = await Profile.find({'applications.currentApplication.travelOption':'PMPML / Bus','applications.currentApplication.applicationStatus':'Under Process'});
        const approvedBusProfiles = await Profile.find({'applications.currentApplication.travelOption':'PMPML / Bus','applications.allApplications.applicationStatus':'Approved'});
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
                            if(approvedBusProfiles[i].applications.allApplications[j].applicationStatus=="Approved")
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






