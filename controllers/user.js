import bcrypt from 'bcryptjs';
import  jwt  from 'jsonwebtoken';

import userModal from '../models/user.js';

const secret = 'testing';

//User SignIn
export const signin = async(req,res) => {
    const {email,password,type} = req.body;

    try {
        const existingUser = await userModal.findOne({email});
        if(!existingUser) return res.status(404).json({message: " User Doesn't Exist!"});

        const isPasswordCorrect = await bcrypt.compare(password,existingUser.password);

        if(!isPasswordCorrect) return res.status(400).json({messag: "Invalid Credentials!"});

        if(!(type === existingUser.type)) return res.status(400).json({message: "Error in type!"});

        const token = jwt.sign({email: existingUser.email , id: existingUser._id, type:existingUser.type}, secret, {expiresIn:"3h"});

        res.status(200).json({message:'Successfully Logged In',result: existingUser,token});

    } catch (error) {
        res.status(500).json({message:'Something Went Wrong.'});
    }
}
// User SignUp
export const signup = async(req,res) => {
    const { name,email,type,password} = req.body;

    try {
        const existingUser = await userModal.findOne({email});
        // if(existingUser) return res.status(400).json({message: " User Already Exists!"});
        if(existingUser) return res.error({status:400 ,message:"User Already Exists!"});
        const hashedPassword = await bcrypt.hash(password,12);

        const result = await userModal.create({email, password: hashedPassword,type:`${type}` ,name:`${name}`})
        res.json({status:200,message:'Registered Successfully!'});
        


    } catch (error) {
        res.status(500).json({message:'Something Went Wrong.'});

    }
}
// Admin SignUp 
export const adminSignup = async(req,res) => {
    const { name,email,type,password} = req.body;

    try {
        const existingUser = await userModal.findOne({email});
        if(existingUser) return res.status(400).json({message: " User Already Exists!"});

        const hashedPassword = await bcrypt.hash(password,12);

        const result = await userModal.create({email, password: hashedPassword,type:`${type}` ,name:`${name}`})


        res.status(200).json({result: result,});


    } catch (error) {
        res.status(500).json({message:'Something Went Wrong.'});

    }
}
