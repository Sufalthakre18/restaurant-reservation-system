import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./src/config/db.js";

dotenv.config();

const app = express();

connectDB()

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'API is running' });
});

const PORT=5000;

app.listen(PORT, ()=>{
    console.log(`Server is running at http://localhost:${PORT}`);
    
});
