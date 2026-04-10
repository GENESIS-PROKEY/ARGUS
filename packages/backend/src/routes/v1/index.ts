import { Router } from 'express';
import { scanRouter } from './scan.js';

export const v1Router = Router();

v1Router.use('/', scanRouter);
