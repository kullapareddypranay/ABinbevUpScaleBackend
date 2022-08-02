const express=require('express')
const router=new express.Router()
const User=require('../models/user')
const auth=require('../middleware/auth')
var bodyParser = require('body-parser')
const OnboardingTasks=require('../models/onboardingtasks');
const { default: mongoose } = require('mongoose')
var urlencodedParser = bodyParser.urlencoded({ extended: false })


router.post('/signup',urlencodedParser,async (req,res)=>{


    try {
        const {name,ph_no,email,password}=req.body;
        const user=await User.findOne({ph_no:ph_no});
        if(!user){
            if(email){
                const u=await User.findOne({email:email});
                if(u){
                    res.status(201).json({"message":"Provided email is already associated"});
                    return
                }
            }
            const user=new User(req.body)
            await user.save()
            const token=await user.generateAuthToken()
            res.status(201).send({user,token,"message":"registered successfully"})
        }else{
            res.status(201).send({user,token,"message":"User Already exists"})
        }
     
    }catch(e){
     res.status(400).send({"message":e.message})

    }
 
 })

 router.post('/signin',urlencodedParser,async(req,res)=>{
    const id=req.body.id;
    var token;
     try{
        
         const user=await User.findByCredentials(id,req.body.password)
         if(user){
            token=await user.generateAuthToken()
         }
         
         res.send({user:user,token:token})

     }catch(e){
         console.log('error',e);
         res.status(400).send({ "message": e.message })
        //  
     }

 })
 router.post('/logout',urlencodedParser,auth,async(req,res)=>{
     try{
         req.user.tokens=req.user.tokens.filter((token)=>{
             return token.token!==req.token
         })
         await req.user.save()
          res.send('logouted')

     }catch(e){
         res.status(500).send()
         console.log(e);
     }
 })

 router.post('/users/logoutAll',auth,async(req,res)=>{
     try{
         req.user.tokens=[]
         await req.user.save()
         res.send('logouted from all')
     }catch(e){
         res.status(500).send()
     }
 })
 
 router.get('/users/me',auth,async (req,res)=>{
     try{
        res.send(req.user);
     }catch(e){
         res.status(500).send();
     }
     
 })

 router.get('/getUser',auth,async(req,res)=>{
    try {
       
        const user= User.findById(req.user._id).populate({path:'buddy reportingTo mentorTo',select:'_id name email ph_no'}).exec();
        user.then((val)=>{
            res.status(200).json(val);
        })
        
    } catch (error) {
        res.status(400).json({"message":error.message})
    }
 })

 router.post('/createuser',auth,urlencodedParser,async(req,res)=>{
    const mentor=req.body.buddy;
    const tasks=req.body.tasks

    try{
        const user=new User(req.body);
        await user.save((err,data)=>{
            if(err){
                console.log(err)
                throw err;
            }else{
                console.log(data)
            
                User.updateOne({_id:mentor},
                    { $push: { mentorTo:mongoose.Types.ObjectId(data._id) } },(err,da)=>{
                        console.log(err);
                        // console.log(da)
                    }
                );

                const task=new OnboardingTasks({tasks:tasks,user:mongoose.Types.ObjectId(data._id) })
                task.save((err,da)=>{
                    console.log(err)
                });

                
            }
        
        });
        res.status(201).send({user,"message":"created successfully"})
    }catch(er){
        res.status(401).send({"message":er.message})
    }


   
 })

 router.post('/users/search',auth,urlencodedParser,async(req,res)=>{
    var searchtext=req.body.querry
    try{
       const user= await User.find({$text:{$search:searchtext}})
       if(user.length==0){
        let data=await User.find({
            $or:[
                {"email":{$regex:searchtext}},
                {"name":{$regex:searchtext}}

        ]
        })
        if(data){
            res.send(data);
        }
       }else{
        res.send(user);
       }
      

    }catch(e){
        console.log(e);
    }

 })
 router.get('/users/getAllUsers',auth,urlencodedParser,async(req,res)=>{

     try{
         const user=await User.find({})
         res.send(user)
     }catch(e){
         res.send(e)
     }
 })
 
 router.get('/users/onboardingusers',auth,urlencodedParser,async(req,res)=>{
    try{
        const user=await User.find({onboardingcompleted:false})
        res.status(200).send(user)
    }catch(e){
        res.send(e)
    }
 })
 router.patch('/users/me',auth,async (req,res)=>{
    const updates =Object.keys(req.body)
    const allowupdates=['name','email','password']
    const isvalid=updates.every((update)=>{
        return allowupdates.includes(update)
    })
    if(!isvalid){
        return res.status(400).send({'error':'invalid updates'})
    }
    try{
        const user=await req.user
        updates.forEach((update)=>{
            user[update]=req.body[update]
        })
        await user.save()
        if(!user){
            return res.status(404).send()
        }
        res.send(user)
    }catch(e)
    {
        res.status(400).send()

    }
})
router.delete('/users/me',auth,async (req,res)=>{
    try{
        //const user=await User.findByIdAndDelete(_id)
        await req.user.remove()
        res.send(req.user)
    }catch(e){
        res.status(500).send()
    }
})

module.exports=router