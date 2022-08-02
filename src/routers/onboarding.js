const express = require('express')
const router = new express.Router()
const OnboardingTasks=require('../models/onboardingtasks');
const auth = require('../middleware/auth')
var bodyParser = require('body-parser')
var urlencodedParser = bodyParser.urlencoded({ extended: false })

router.post('/createTask',auth,urlencodedParser,async(req,res)=>{
    const users=req.body.users;
    const tasks=req.body.tasks
    try{

        
        users.forEach(async (element) => {
            const task=new OnboardingTasks({tasks:tasks,user:element})
            await task.save();
        });

        res.status(201).send({"message":"created successfully"})
        

    }catch(e){
        res.status(401).send({"message":e.message})
    }
})

router.get('/getOnboardingTasks',auth,urlencodedParser,async(req,res)=>{
    try{
        const tasks=await OnboardingTasks.find().populate('user').exec()
        res.status(200).send(tasks)
    }catch(e){
        req.status(400).send(e)
    }
})

router.post('/addOnboardingTask',auth,urlencodedParser,async(req,res)=>{
    const _id=req.body._id;
    const user=req.body.user;
    const task={task:req.body.task,status:false}
    try{
        OnboardingTasks.updateOne({_id:_id,user:user}, { $push: { tasks:task } },(err,da)=>{
            if(err){
                console.log(err);
            }
            console.log(da)
            res.send(da)
        })
    }catch(e){
        res.send(e)
    }
})

module.exports=router