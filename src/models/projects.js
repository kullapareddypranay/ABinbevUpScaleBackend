const mongoose = require('mongoose')
const projectSchema = mongoose.Schema({
    projecttitle: {
        type: String,
        required: true,
        trim: true,
        unique:true
    },
    projectowner:[{
        type : mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    projectmembers: [{
        type : mongoose.Schema.Types.ObjectId,
        ref: 'User'}],
     projectstakeholders: [{
         type : mongoose.Schema.Types.ObjectId,
        ref: 'User'}],
    projectdescription:{
        type:String
    },
    projectstatus:{
        type:String
    },
    projectstartdate:{
        type:Date
    },
    projectunder:{
        type:String
    },
    projectlink:{
        type:String
    }
})


const Project = mongoose.model('Project', projectSchema)
module.exports = Project;