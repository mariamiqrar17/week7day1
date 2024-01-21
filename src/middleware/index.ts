import express from 'express';
import {get, merge} from 'lodash';
import { getUserBySessionToken } from '../db/users';

export const isOwner = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const {id} = req.params;
        const currentUserId = get(req, 'identity._id') as string

        if (!currentUserId) {
            return res.status(403).send({message: `${currentUserId} is not exist`})
        }

        if (currentUserId.toString() !== id) {
            return res.status(403).send({message: "Id not matched!"})
        }
        
        next();
    } catch (error) {
        console.log(error.message);
        return res.status(400).send({error: error.message, message: "Error in Server"})
        
    }
}

export const isAuthenticated = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const sessionToken = req.cookies['ANTONIO-AUTH'];
        if (!sessionToken) {
            return res.status(403).send({message: "Session is not defined"})
        }

        const existingUser = await getUserBySessionToken(sessionToken);
        if (!existingUser) {
            return res.status(403).send({message: "User Not exist!"})
        }

        merge(req, {identity: existingUser});
        return next();
        
    } catch (error) {
        console.log(error.message);
        return res.status(400).send({message: "Internal Server Error", error: error.message})
    }
}