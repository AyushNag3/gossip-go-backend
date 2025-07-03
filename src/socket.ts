import { Server as SocketIoServer } from "socket.io"
import { PrismaClient } from "../generated/prisma"
import type { MessageType } from "../generated/prisma"


const prisma = new PrismaClient()

// @ts-ignore
export const setupsocket = (server) => {
  const io = new SocketIoServer(server, {
    cors: {
      origin: "https://gossip-go-ayush-nags-projects.vercel.app", // frontend site
      credentials: true,
    },
  })

  const userSocketMap = new Map() ;

  // @ts-ignore
  const disconnect = (socket) => {
    console.log(`Client Disconnected : ${socket.id}`)
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId)
        break
      }
    }
  }

  const sendMessage = async (message: any) => {
    console.log(message)
    const senderSocketId = userSocketMap.get(String(message.sender))
    const recipientSocketId = userSocketMap.get(String(message.recipient))

    // Fix: Properly structure the data object for Prisma
                                 //@ts-ignore
    const createMessage = await prisma.Message.create({
      data: {
        senderId: Number.parseInt(message.sender),
        recipientId: Number.parseInt(message.recipient),
        messageType: message.messageType as MessageType,
        content: message.content,
        fileUrl: message.fileUrl,
      },
    })

    const messageData = await prisma.message.findFirst({
      where: {
        id: createMessage.id, // use `id` as it's an Int in Prisma
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            FirstName: true,
            LastName: true,
            image: true,
            color: true,
          },
        },
        recipient: {
          select: {
            id: true,
            email: true,
            FirstName: true,
            LastName: true,
            image: true,
            color: true,
          },
        },
      },
    })
  //  
   if (!recipientSocketId && !senderSocketId) {
    console.warn(`No socket found for either sender or recipient , ${recipientSocketId} , ${senderSocketId}`);
  }
  else console.log(`${recipientSocketId} , ${senderSocketId}`)
  
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("receiveMessage", messageData)
    }
    if (senderSocketId) {
      io.to(senderSocketId).emit("receiveMessage", messageData)
    }
  }

  // @ts-ignore
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId
    if (userId) {
      userSocketMap.set(userId, socket.id)
      console.log(`User connected : ${userId} with socket ID : ${socket.id}`)
    } else {
      console.log("User Id not provided during connection ")
    }

    socket.on("sendMessage", sendMessage)
    socket.on("disconnect", () => disconnect(socket))
  })
}
