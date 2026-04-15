import jwt from 'jsonwebtoken';
import { User } from './db/models/user';
import { Request, Response, NextFunction } from 'express';

const secret = '4cdf204cbe2da7e6b7f2a2d5ee22e091a48cb2812df19c92d394aab90a0e705d9cfc520cf56ecadf034bdbe63074a71f46e83248e8efce0d2c8a421eb16a5e26'; // Замените на ваш секретный ключ


export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.sendStatus(401); // Unauthorized

    jwt.verify(token, secret, (err: any, user: any) => {
        if (err) return res.sendStatus(403); // Forbidden
        next();
    });
};

export const generateToken = (user: User) => {
    return jwt.sign({tgId: user.tgId}, secret, { expiresIn: '24h' });
}