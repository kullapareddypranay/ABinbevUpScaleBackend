const express = require('express')
const router = new express.Router()
const Project = require('../models/projects')
const auth = require('../middleware/auth')
var bodyParser = require('body-parser')
const { default: mongoose } = require('mongoose')
var urlencodedParser = bodyParser.urlencoded({ extended: false })

router.post('/projects', urlencodedParser, auth, async (req, res) => {
    const projmem=req.body.projectmembers
    const projstack=req.body.projectstakeholders
    let proj = new Project({projecttitle:req.body.projecttitle,
        projectdescription:req.body.projectdescription,
        projectstatus:req.body.projectstatus,
        projectstartdate:req.body.projectstartdate,
        projectmembers:projmem,
        projectunder:req.body.projectunder,
        projectowner:req.body.projectowner,
        projectstakeholders:projstack,
        projectlink:req.body.projectlink
    })

    try {
     await proj.save();
     res.status(201).send({proj:proj,message:'Project has been Added'})
    } catch (e) {
        res.status(400).send(e);
    }


})

router.post('/updateproject/:id',auth,urlencodedParser,async(req,res)=> {
   
    const _id = req.params.id;
    const projmem=[];
  
   const projstack=[];
   req.body.projectmembers.forEach(obj=>{
    projmem.push(obj['_id']);
  })
  req.body.projectstakeholders.forEach(obj=>{
    projstack.push(obj['_id'])
  })

    const projectdate=req.body.projectstartdate;
    
    const link=req.body.projectlink;
    const status=req.body.projectstatus;
    
    try {
        console.log("called")
      
       Project.updateOne({_id:_id},
            {$set:{
                 projectmembers:projmem,
                 projectstakeholders:projstack,
                 projectstartdate:projectdate,
                 projectlink:link,
                 projectstatus:status 
         }},(err,rata)=>{
            console.log(err)
            if(err){
                throw err
            }else{
                res.status(201).send()
            }
            console.log(rata)
         }
        );

        // proj.then()
       
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/project/:id',urlencodedParser,auth,async(req,res)=>{
    const _id=req.params.id;
    try{
        const project=Project.findById({_id:_id}).populate({path:'projectowner projectmembers projectstakeholders',select:'_id name email ph_no'}).exec()
        project.then((result)=>{
            res.send(result)
        })
       
        
    }catch(e){
        res.send(e)
    }
})
// router.post('/updateProject/:id',urlencodedParser,auth,async(req,res)=>{
//     const _id=req.params._id;
//     try{
//         const proj=await Project.findById(_id)
//         proj.projectmembers=req
//     }
// })
router.get('/projects',urlencodedParser,async(req,res)=>{
    try{
        const proj=await Project.find({})
        res.send(proj);
    }catch(e){
        res.send(e)
    }
})

module.exports=router