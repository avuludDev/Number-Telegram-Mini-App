import * as express from 'express';
import { User } from '../db/models/user';

declare global {
    namespace Express {
        interface Request {
            user?: User; // или укажите более конкретный тип для user
        }
    }
}
