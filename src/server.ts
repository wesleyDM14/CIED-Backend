import express from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import routes from "./routes";
import http from 'http';
import { Server } from "socket.io";

import { errorMiddleware } from "./middlewares/errorMiddleware";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    }
});

app.use(cors());
app.use(express.json());
app.use(routes);
app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

io.on("connection", (socket) => {
    console.log("Novo cliente conectado", socket.id);

    socket.on("disconnect", () => {
        console.log("Cliente desconectado", socket.id);
    });
});

export { io };