import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import router from './routes/index.js';

const app=express();

// app.use(cors({origin:"http://localhost:5173",credentials:true}))
app.use(cors({origin:"https://edutechlearning.netlify.app",credentials:true}))
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET))
app.use(morgan("dev"));

//routes
app.use('/api/v1',router)

export {app}


