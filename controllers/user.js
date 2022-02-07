import bcrypt from 'bcryptjs';
import  jwt  from 'jsonwebtoken';

import userModal from '../models/user.js';
import admin from '../models/admins.js';
import profile from '../models/profile.js';

const secret = 'testing';

//User SignIn
export const signin = async(req,res) => {
    const {email,password,type} = req.body;

    try {
        const existingUser = await userModal.findOne({email});
        const existingProfile = await profile.findOne({email});
        const existingAdmin = await admin.findOne({email});
        if(!existingUser && !existingAdmin) return res.json({status:404,message: "User/Admin Doesn't Exist!"});
        if (existingUser) {
            const isPasswordCorrect = await bcrypt.compare(password,existingUser.password);
            if(!isPasswordCorrect) return res.json({status:400,message: "Invalid Credentials!"});
            if(!(type === existingUser.type)) return res.json({status:400,message: "Error in type!"});
            const token = jwt.sign({email: existingUser.email ,collegeName: existingProfile.collegeName, id: existingUser._id, type:existingUser.type}, secret, {expiresIn:"3h"});
            res.json({status:200,message:'Successfully Logged In As Student',result: existingUser,token});
        }else if (existingAdmin) {
            const isPasswordCorrect = await bcrypt.compare(password,existingAdmin.password);
            if(!isPasswordCorrect) return res.json({status:400,message: "Invalid Credentials!"});
            if(!(type === existingAdmin.type)) return res.json({status:400,message: "Error in type!"});
            const token = jwt.sign({email: existingAdmin.email ,collegeName: existingAdmin.collegeName, id: existingAdmin._id, type:existingAdmin.type}, secret, {expiresIn:"5h"});
            res.json({status:200,message:'Successfully Logged In As Admin',result: existingAdmin,token});
        }





    } catch (error) {
        res.json({status:500, message:'Something Went Wrong.'});
    }
}
// User SignUp
export const signup = async(req,res) => {
    const { name,email,type,password} = req.body;

    try {
        const existingUser = await userModal.findOne({email});
        const existingAdmin = await admin.findOne({email});
        if(existingUser || existingAdmin) return res.json({status:400, message:"User/Admin Already Exists!"});
        const hashedPassword = await bcrypt.hash(password,12);


        const result = await userModal.create({email, password: hashedPassword,name:`${name}`,type:`${type}`});
        res.json({status:200,message:'Registered Successfully!'});
        


    } catch (error) {
        res.json({status:500, message:'Something Went Wrong.'});

    }
}
// Admin SignUp 
export const adminSignup = async(req,res) => {
    const { name,email,type,collegeName,password} = req.body;

    try {
        const existingAdmin = await admin.findOne({email});
        const existingUser = await userModal.findOne({email});
        if(existingUser) return res.json({status:400,message: " User Already Exists with this Email Please Try Using A different Email!"});
        if(existingAdmin) return res.json({status:400,message: " Admin Already Exists!"});

        const hashedPassword = await bcrypt.hash(password,12);

        const result = await admin.create({email, password: hashedPassword,type, collegeName:`${collegeName}` ,name:`${name}`})


        res.json({status:200, message:"Admin registered Successfully!"});


    } catch (error) {
        res.json({status:500, message:'Something Went Wrong.'});

    }
}
