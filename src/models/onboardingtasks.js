const mongoose = require('mongoose')
const onBoardingSchema=mongoose.Schema({
    tasks:[{
        task:{
            type:String
        },
        status:{
            type:Boolean,
            default:false
        }
    }],
    user:{
        type : mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})


const OnboardingTasks=mongoose.model('OnboardingTasks',onBoardingSchema)
module.exports=OnboardingTasks