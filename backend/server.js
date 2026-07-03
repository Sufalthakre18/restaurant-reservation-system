import express from "express";
import cors from "cors";


const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is running' });
});

const PORT=5000;

app.listen(PORT, ()=>{
    console.log(`Server is running at http://localhost:${PORT}`);
    
});
