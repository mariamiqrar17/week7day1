import express  from 'express';
import {deleteUserById, getUserById, getUsers} from '../db/users';

export const getAllUsers = async (req: express.Request, res: express.Response) => {
    try {
        const users = await getUsers();

        return res.status(200).send({data:users})
    } catch (error) {
        console.log(error.message);
        return res.status(400).send({message: "Internal Server Error", error: error.message})   
    }
}

export const deleteUser = async (req: express.Request, res: express.Response) => {
    try {
        const {id} = req.params;

        const deleteUser = await deleteUserById(id);
        return res.status(200).send({data:deleteUser})
    } catch (error) {
        console.log(error.message);
        return res.status(400).send({error: error.message, message: 'Error in deleting user'})
        
    }
}


export const updateUser = async (req: express.Request, res: express.Response) => {
    try {
        const {id} = req.params;
        const {username} = req.body;
        
        if (!username) {
            return res.status(400).send({message: "Username not exist!"})
        }

        const user = await getUserById(id);
        user.username = username;
        await user.save();
        return res.status(200).send({data: user})
    } catch (error) {
        console.log(error.message);
        return res.status(400).send({message: "Error in updating", error: error.message})
        
    }
}
