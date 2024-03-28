const express = require("express")
const mongoose = require("mongoose")
const jwt = require('jsonwebtoken')
const cors = require('cors')
const Registeruser = require("./model")
const middleware = require("./middleware")
const app = express()


mongoose.connect("mongodb://127.0.0.1:27017/fsd").then(()=>{
    console.log("db connected")
 }).then(
    ()=> console.log("db connection established")
)



app.use(express.json())     

app.use(cors({origin:"*"}))

app.post('/register',async(req,res)=>{
    try{
        const{username,email,password,confirmpassword}= req.body
        let exist = await Registeruser.findOne({email})
        if(exist){
            return res.status(400).send("user already exist")
        }
        if(password !== confirmpassword){
            return res.status(400).send("password are not matching")
        }
        let newUser = new Registeruser({
            username,
            email,
            password,
            confirmpassword

        })
        await newUser.save()
        res.status(200).send("user registered successfully")

    }
    catch(err){
        console.log(err)
        return res .status(500).send("internal server error")

    }

})
app.post('/login',async(req,res)=>{

    try{
        const {email,password} = req.body
        let exist = await Registeruser.findOne({email})
        if(!exist){
            return res.status(400).send("user not found")
        }
        if(exist.password !== password){
            return res.status(400).send("invalid crendtails")
        }
        let payload = {
            user :{
                id:exist.id
            }
        }
        jwt.sign(payload,'jwtSecret',{expiresIn:3600000},
            (err,token)=>{
                if(err) throw err
                return res.json({token})
            })

    }
    catch(err){
        console.log(err)
        return res.status(500).send("server error")

    }
})
app.get("/myprofile",middleware,async(req,res)=>{
    try{
        let exist = await Registeruser.findById(req.user.id)
        if(!exist){
            return res.status(400).send("user not exist")
        }
        res.json(exist)

    }
    catch(err){
        console.log(err)
        return res.status(500).send("server error")
    }
})
app.listen(5000)