import { PrismaClient } from "../../generated/prisma"
const prisma = new PrismaClient()
import type { Request, Response, NextFunction } from "express"

export const getMessages = async (req:Request, res: Response, next : NextFunction) => {
    try {                  //@ts-ignore
         const user1 = req.userId ;
         const user2 = req.body.id ;
        
        if (!user1 || !user2) {
            return res.status(400).send("Both User ID's are required")
        }   
                                     //@ts-ignore
        const messages = await prisma.Message.findMany({
            where: {
              OR: [
                { senderId: user1, recipientId: user2 },
                { senderId: user2, recipientId: user1 }
              ]
            },
            orderBy: {
              timestamp: 'asc'
            }
          });
  return res.status(200).json({messages}) ;   

    } catch(error) {
     console.log({error}) 
     return res.status(500).send("Internal Server Error")
    }
}