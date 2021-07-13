const mongoose=require('mongoose')
const validator=require('validator')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const Portfolio=require('./portfolio')



const userschema=new mongoose.Schema({
    email:{
        type:String,
        unique:true,
        required:true,
        trim:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is not valid')
            }

        }
    },
    password:{
        type:String,
        required:true,
        trim:true,
    }, 
    follows:[{
        company:{
            type:mongoose.Schema.Types.ObjectId,
            required:true
        }
    }],
    
    
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
},{
    timestamps:true
})

userschema.virtual('portfolio',{
    ref:'Portfolio',
    localField:'_id',
    foreignField:'owner'
})


userschema.methods.generateAuthToken=async function (){
    const user=this
    const token=jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET)
    user.tokens=user.tokens.concat({token})
    await user.save()
    return token
}

userschema.methods.toJSON=function(){
    const user=this;
    const userObject=user.toObject()
    delete userObject.password
    delete userObject.tokens
    return userObject

}

userschema.statics.findByCredentials=async (email,password)=>{
   
    const user=await User.findOne({email})
    

    if(!user)
    {
        console.log('no user')
        throw new Error('no user')
    }
    const isMatch=await bcrypt.compare(password,user.password)

    if(!isMatch)
    {
        console.log('password is wrong')
        throw new Error('Unable to login')
    }

    return user

}


//hash the plaintext password
userschema.pre('save',async function(next){
    const user=this
    console.log('just before saving')
    if(user.isModified('password')){
        user.password=await bcrypt.hash(user.password,8)


    }

    next()
})

userschema.pre('remove',async function(next){
    const user=this

    await Portfolio.deleteMany({owner:user._id})

    next()
})

const User=mongoose.model('User',userschema)

module.exports=User