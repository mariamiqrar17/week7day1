import express from "express";
import { getUserByEmail, createUser } from '../db/users';
import { random, authentication } from '../helpers'

export const login =async (req: express.Request, res: express.Response) => {
   try {
    const {email, password} = req.body;

    if (!email || !password) {
        return res.status(400).send({message: "Enter email or password!"});
    }

    const user = await getUserByEmail(email).select('+authentication.salt +authentication.password');
    if (!user) {
        return res.status(400).send({message: "User not found"});
    }

    const expectedHash = authentication(user.authentication.salt, password);

    if (user.authentication.password !== expectedHash) {
        return res.status(403).send({message: "Password is incorect!"});
    }

    const salt: string = random();
    user.authentication.sessionToken = authentication(salt, user._id.toString());

    await user.save();
    res.cookie('ANTONIO-AUTH', user.authentication.sessionToken, {domain: 'localhost', path: '/' })
    return res.status(200).send({data:user, message: "User login successfully!"})
} catch (error) {
    console.log(error.message);
    return res.status(400).send({message:"Error in registering", error: error.message, status:false})
   } 
}

export const register = async (req: express.Request, res: express.Response) => {
    try {
        const {email, password, username} = await req.body;
        console.log("This is body", req.body)

        if (!email || !password || !username) {
            return res.status(400).send('Incomplete registration information');
        }
    
        const existingUser = await getUserByEmail(email);

        console.log(existingUser);
        
        if (existingUser) {
            return res.status(409).send({message:'Email already registered',status: false});
        }

        const salt: string = random();
        const user: object = await createUser({
            email,
            username,
            authentication:{
                salt,
                password: authentication(salt, password)
            }
        })

        return res.status(200).send({status: true, data: user})
    } catch (error) {
        console.log(error.message);
        res.status(400).send({message:"Error in registering", error: error.message, status:false})
    }
}