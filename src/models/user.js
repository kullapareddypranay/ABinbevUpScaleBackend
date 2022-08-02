const mongoose=require('mongoose')
const validator=require('validator')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')

const userSchema=mongoose.Schema({

    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('not valid email')
            }
        }

    },
    name:{
        type:String
    },
    ph_no:{
        unique: true,
        type: String,
        required: true,
        trim: true
    },

    password:{
        type:String,
        required:true,
        minlength:8,
        trim:true,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('password cannot contain "password"')
            }

        }
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    sockets:[{
        socket:{
            type:String
        }
    }],
    signedup_on: {
        type: String,
        default: Date.now()
    },
    user_level:{
        type:String
    },
    otp: {
        type: Number,
        default: null
    },
    phone_verified: {
        type: Boolean,
        default: false
    },
    email_verified: {
        type: Boolean,
        default: false
    },
    notification_tokens: {
        type: Array
    },
    buddy:{
        type : mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reportingTo:{
        type : mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    mentorTo:[{
        type : mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    designation:{
        type:String
    },
    aliasname:{
        type:String
    },
    onboardingcompleted:{
        type:Boolean,
        default:true
    },
    team:{
        type:String,
        default:'upScale'
    }

   
},{
    timestamps:true
})

userSchema.methods.toJSON=function(){
    const user=this
    const userobject=user.toObject()
    delete userobject.password
    delete userobject.tokens
    return userobject
}

userSchema.methods.generateAuthToken=async function(){
    const user=this
    const token=jwt.sign({_id: user._id.toString()},process.env.JWT_SECRET||'upscaler')

    user.tokens=user.tokens.concat({token})

    await user.save()

    return token
}

userSchema.statics.findByCredentials=async (id,password)=>{
    const user =await User.findOne({ $or: [{ email: id }, { ph_no: id }] })
    if(!user){
        throw new Error('unable to login')
    }

    const isMatch=await bcrypt.compare(password,user.password)

    if(!isMatch){
        throw new Error('unable to login')
    }

    return user
}

userSchema.pre('save',async function(next){
    const user=this

    if(user.isModified('password')){
        user.password=await bcrypt.hash(user.password,8)

    }

    next()
})

userSchema.index({"name":"text","email":"text"})

const User=mongoose.model('User',userSchema)


module.exports=User