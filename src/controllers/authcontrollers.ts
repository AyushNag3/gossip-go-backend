import type { Request, Response, NextFunction } from "express"
import bcrypt from "bcryptjs"
const jwt = require("jsonwebtoken")
import { PrismaClient } from "../../generated/prisma"

const prisma = new PrismaClient()

const createToken = (email: string, userId: number) => {
  return jwt.sign(
    {
      data: {
        email,
        userId,
      },
    },
    process.env.JWT_KEY,
    { expiresIn: 60 * 60 },
  )
}
export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = req.body.email
    const password = req.body.password
    const confirmpassword = req.body.confirmpassword
    // console.log(`${confirmpassword} and ${password}`)
    if (password !== confirmpassword) {
      return res.status(422).send("Password and Confirm Password does not match")
    }
    if (!email || !password) {
      return res.status(400).send("Email and Password is required")
    }
    const hashedPassword = await bcrypt.hash(password, 10) // Hash password //
    // @ts-ignore
    const user = await prisma.User.create({
      data: {
        email: email,
        password: hashedPassword,
      },
    })
    res.cookie("jwt_cookie", createToken(email, user.id), {
      maxAge: 1000 * 60 * 60,
      httpOnly: true, // Keeps it secure from JS
      secure: false, // true if using HTTPS
      sameSite: "lax",
    })
    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        password: user.password,
        FirstName: user.FirstName,
        LastName: user.LastName,
        image: user.image,
        colour: user.color,
        ProfileSetup: user.ProfileSetup,
      },
    })
  } catch (error) {
    console.log(error)
    return res.status(500).send("Internal server error")
  }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = req.body.email
    const password = req.body.password
    // console.log(password)
    const hashPassword = await bcrypt.hash(password, 10)
    if (!email || !password) {
      return res.status(400).send("Email and Password is required")
    } // @ts-ignore
    const user = await prisma.User.findUnique({
      where: {
        email: email,
      },
    })
    if (!user) {
      return res.status(404).send("User with the given email not found")
    }
    // console.log(user.password)
    const auth = await bcrypt.compare(password, user.password)
    if (!auth) {
      return res.status(422).send("Password is Incorrect")
    }
    res.cookie("jwt_cookie", createToken(email, user.id), {
      maxAge: 1000 * 60 * 60,
      httpOnly: true, // Keeps it secure from JS
      secure: false, // true if using HTTPS
      sameSite: "lax",
    })
    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        password: user.password,
        FirstName: user.FirstName,
        LastName: user.LastName,
        image: user.image,
        colour: user.color,
        ProfileSetup: user.ProfileSetup,
      },
    })
  } catch (error) {
    console.log(error)
    return res.status(500).send("Internal Server Error")
  }
}

interface customtype extends Request {
  userId?: string
  file?: Express.Multer.File
}

export const getUserInfo = async (req: customtype, res: Response, next: NextFunction) => {
  try {
    //@ts-ignore
    const user = await prisma.User.findFirst({
      where: {
        id: req.userId,
      },
    })
    if (!user) {
      return res.status(404).send("User with the given id not found")
    }
    return res.status(200).json({
      id: user.id,
      email: user.email,
      password: user.password,
      FirstName: user.FirstName,
      LastName: user.LastName,
      image: user.image,
      color: user.color,
      ProfileSetup: user.ProfileSetup,
    })
  } catch (error) {
    console.log({ error })
    return res.status(500).send("Internal Server Error")
  }
}

export const UpdateProfile = async (req: customtype, res: Response, next: NextFunction) => {
  try {
    const firstname = req.body.firstname
    const lastname = req.body.lastname
    const selectedcolor = req.body.selectedcolor

    // console.log(firstname + lastname + selectedcolor)
    if (!firstname || !lastname || selectedcolor < 0) {
      return res.status(400).send("FirstName and LastName and Color is required")
    }
    //@ts-ignore
    const demo = await prisma.User.findFirst({
      where: {
        id: req.userId,
      },
    })
    if (!demo) {
      return res.status(404).send("User with the given id not found")
    }
    //@ts-ignore
    const user = await prisma.User.update({
      where: {
        email: demo.email,
      },
      data: {
        FirstName: firstname,
        LastName: lastname,
        color: selectedcolor,
        ProfileSetup: true,
      },
    })

    return res.status(200).json({
      id: user.id,
      email: user.email,
      password: user.password,
      FirstName: user.FirstName,
      LastName: user.LastName,
      image: user.image,
      color: user.color,
      ProfileSetup: user.ProfileSetup,
    })
  } catch (error) {
    console.log({ error })
    return res.status(500).send("Internal Server Error")
  }
}

export const addprofileimage = async (req: customtype, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).send("File is required")
    }

    // Get the filename that was generated by multer
    const filename = req.file.filename

    // @ts-ignore
    const demo = await prisma.User.findFirst({
      where: {
        id: req.userId,
      },
    })

    if (!demo) {
      return res.status(404).send("User not found")
    }

    // Update the user with just the filename
    const updatedUser = await prisma.user.update({
      where: {
        email: demo.email,
      },
      data: {
        image: filename, // Store just the filename
      },
    })

    return res.status(200).json({
      image: filename, // Return just the filename
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Something went wrong" })
  }
}

export const deleteprofileimage = async (req: customtype, res: Response, next: NextFunction) => {
  try {

    //@ts-ignore
    const demo = await prisma.User.findFirst({
      where: {
        id: req.userId,
      },
    })
    if (!demo) {
      return res.status(404).send("User with the given id not found")
    }
    //@ts-ignore
    const user = await prisma.User.update({
      where: {
        email: demo.email,
      },
      data: {
        image: null,
      },
    })

    return res.status(200).json({
      id: user.id,
      email: user.email,
      password: user.password,
      FirstName: user.FirstName,
      LastName: user.LastName,
      image: user.image,
      color: user.color,
      ProfileSetup: user.ProfileSetup,
    })
  } catch (error) {
    console.log({ error })
    return res.status(500).send("Internal Server Error")
  }
}

export const logout = async (req:Request, res: Response, next : NextFunction) => {
 try {
    res.cookie("jwt_cookie", "", {maxAge:1, secure:false,sameSite:"lax"});
    return res.status(200).send("Logout Successful")
 } catch(error) {
  console.log({error}) 
  return res.status(500).send("Internal Server Error")
 }
}