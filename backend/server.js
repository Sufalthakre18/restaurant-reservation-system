import "./src/config/env.js";;
import http from "http";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { initSocket } from "./src/utils/socket.js";




const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();

  const server = http.createServer(app);
  initSocket(server); // attaches Socket.io to the same HTTP server real-time updates

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();
