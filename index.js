import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from "morgan";
import * as dotenv from 'dotenv';
import userRouter from "./routes/User.js";
import http from 'http';
import { Server } from 'socket.io';
import { ACTIONS } from './Actions.js';
const app = express();
const server = http.createServer(app);
const io = new Server(server);

dotenv.config({ path: "./config/config.env" });
app.use(cors());
app.use(express.json());
app.use(morgan("dev")); // why?

const userSocketMap = {};
const roomCodeMap = {};
function getAllConnectedClients(roomId) {
    // Map
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
        (socketId) => {
            return {
                socketId,
                username: userSocketMap[socketId],
            };
        }
    );
}

io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    socket.on(ACTIONS.JOIN, ({ roomId, username, token }) => {
        console.log("user joined", username)
        userSocketMap[socket.id] = username;
        if (!roomCodeMap[roomId]) {
            roomCodeMap[roomId] = ''; // Initialize code for the room
        }
        socket.join(roomId);
        const clients = getAllConnectedClients(roomId);
        clients.forEach(({ socketId }) => {
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients,
                username,
                socketId: socket.id,
            });
        });
        console.log(JSON.stringify(userSocketMap))
    });

    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code, line, ch }) => {
        roomCodeMap[roomId] = code; // Update the code for the room
        // socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
        // console.log(to);
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code: roomCodeMap[roomId] }, line, ch);
    });
    socket.on(ACTIONS.SELECT, ({ roomId, anchor, head }) => {
        console.log(head);
        socket.in(roomId).emit(ACTIONS.SELECT, anchor, head);
    });

    socket.on(ACTIONS.SYNC_CODE, ({ socketId, roomId, code }) => {
        io.to(socketId).to(roomId).emit(ACTIONS.CODE_CHANGE, { code: roomCodeMap[roomId] });
    });

    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                username: userSocketMap[socket.id],
            });
        });
        delete userSocketMap[socket.id];
        socket.leave();
        console.log(JSON.stringify(userSocketMap))
    });
});


app.use("/api/v1", userRouter);
mongoose.connect(process.env.MONGODB_URL).then(() => {
    server.listen(process.env.PORT, () => console.log(`Listening on port ${process.env.PORT}`));
}).catch(err => console.log(err));

