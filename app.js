/* eslint-disable no-undef */
// eslint-disable-next-line no-undef
const express =require("express")

require("./DB/db")
require("dotenv").config()
const { sendError } = require("./utils/helper")
const { errormessages } = require("./utils/errormessages")
const statusCode = require("./utils/statuscode")

const app =express()
const port =process.env.PORT
 
const userrouter = require("./routes/user")
const todoroutes =require("./routes/user_todo")


app.use(express.json())


app.use('/user',userrouter)
app.use('/todo',todoroutes)


app.use("*",(req,res)=>{
    sendError(res,errormessages.PAGE_NOT_FOUND,statusCode.NOT_FOUND)
})

app.listen(port,()=>{
    console.log(`your port is up on server ${port}`);
})