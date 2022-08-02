const express=require('express')
const mongoose=require('mongoose')
const http=require('http')
const cors = require('cors')
const userrouter=require('./routers/user')
const projrouter=require('./routers/project')
const onboardingrouter=require('./routers/onboarding')
const socketio=require('socket.io')

mongoose.connect('mongodb+srv://upscale:upscale@cluster0.l1yrjkf.mongodb.net/upscale?retryWrites=true&w=majority',{useNewUrlParser:true, useUnifiedTopology:true})
const db=mongoose.Connection



const app=express()
app.use(express.json())
app.use(cors())
app.use(userrouter)
app.use(projrouter)
app.use(onboardingrouter)
const port=process.env.PORT || 3000

const server=http.createServer(app)

const io=socketio(server)


server.listen(port,()=>{
    console.log('server is up on port '+port)
})
