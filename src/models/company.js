const mongoose=require('mongoose')
const validator=require('validator')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const Job=require('./job')



const companyschema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
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
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
},{
    timestamps:true
})

companyschema.virtual('jobs',{
    ref:'Job',
    localField:'_id',
    foreignField:'owner'
})


companyschema.methods.generateAuthToken=async function (){
    const company=this
    const token=jwt.sign({_id:company._id.toString()},process.env.JWT_SECRET)
    company.tokens=company.tokens.concat({token})
    await company.save()
    return token
}

companyschema.methods.toJSON=function(){
    const company=this;
    const companyObject=company.toObject()
    delete companyObject.password
    delete companyObject.tokens
    return companyObject

}

companyschema.statics.findByCredentials=async (email,password)=>{
   
    const company=await Company.findOne({email})
    

    if(!company)
    {
        throw new Error('unable to login')
    }
    const isMatch=await bcrypt.compare(password,company.password)

    if(!isMatch)
    {
        throw new Error('Unable to login')
    }

    return company

}


//hash the plaintext password
companyschema.pre('save',async function(next){
    const company=this
    if(company.isModified('password')){
        company.password=await bcrypt.hash(company.password,8)


    }

    next()
})

companyschema.pre('remove',async function(next){
    const company=this

    await Job.deleteMany({owner:company._id})

    next()
})

const Company=mongoose.model('Company',companyschema)

module.exports=Company