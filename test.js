import dotenv from 'dotenv';
dotenv.config();
console.log('dotenv loaded');

import express, { json, urlencoded } from 'express';
console.log('express loaded');

import cors from 'cors';
console.log('cors loaded');

import helmet from 'helmet';
console.log('helmet loaded');

import morgan from 'morgan';
console.log('morgan loaded');

import passport from 'passport';
console.log('passport loaded');

import logger from './utils/logger.js';
console.log('logger loaded');

import * as validations from './middleware/validation.js';
console.log('validations loaded');

import authRoutes from './routes/auth.js';
console.log('authRoutes loaded');

// import qrCodeRoutes from './routes/qrCode.js';
// console.log('qrCodeRoutes loaded');

// import dashboardRoutes from './routes/dashboard.js';
// console.log('dashboardRoutes loaded');

// import queryRoutes from './routes/query.js';
// console.log('queryRoutes loaded');

// import './config/passport.js';
// console.log('passport config loaded');

// ...continue with app setup and log after each major step...