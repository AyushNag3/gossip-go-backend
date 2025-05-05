import { timeStamp } from "console";
import { PrismaClient } from "../../generated/prisma"
const prisma = new PrismaClient()
import type { Request, Response, NextFunction } from "express"

export const SearchContact = async (req:Request, res: Response, next : NextFunction) => {
    try {
       const searchterm = req.body.searchTerm ;
        if (searchterm === undefined || searchterm === null) {
           return res.status(400).send("SearchTerm is required. ")
        }
            const contacts = await prisma.user.findMany({
                where: {
                  AND: [
                    {
                      id: {      //@ts-ignore
                        not: req.userId,
                      },
                    },
                    {
                      OR: [
                        { FirstName: { contains: searchterm, mode: "insensitive" } },
                        { LastName: { contains: searchterm, mode: "insensitive" } },
                        { email: { contains: searchterm, mode: "insensitive" } },
                      ],
                    },
                  ],
                },
              });
              
              return res.status(200).json({
                contacts
              })
    } catch(error) {
     console.log({error}) 
     return res.status(500).send("Internal Server Error")
    }
   }


   
export const getUserContactForDm = async (req:Request, res: Response, next : NextFunction) => {
    try {            //@ts-ignore
      const userId = req.userId;
                                     //@ts-ignore
      const messages = await prisma.Message.findMany({
        where: {
          OR: [
            { senderId: userId },
            { recipientId: userId }
          ]
        },
        orderBy: {
          timestamp: 'desc'
        },
        include: {
          sender: true,
          recipient: true
        }
      });
  
      const contactsMap = new Map();
  
      for (const msg of messages) {
        const contact = msg.senderId === userId ? msg.recipient : msg.sender;
        if (!contactsMap.has(contact?.id)) {
          contactsMap.set(String(contact?.id), {
            id: contact?.id,
            lastMessageTime: msg.timestamp,
            email: contact?.email,
            FirstName: contact?.FirstName,
            LastName: contact?.LastName,
            image: contact?.image,
            color: contact?.color,
          });
        }
      }
  
      const contacts = Array.from(contactsMap.values());
  
      res.json({ contacts });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Something went wrong" });
    }
  };
  