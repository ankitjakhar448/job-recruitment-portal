const { ObjectID } = require('bson')
const express=require('express')
const Company=require('../models/company')
const auth=require('../middleware/companyauth')
const multer=require('multer')
const sharp=require('sharp')
const {sendwelcomemail,sendcancelationemail}=require('../emails/account')

const router=new express.Router()


router.post('/company',async (req,res)=>{
    
    const company=new Company(req.body)

     try
     {
         await company.save()
        // sendwelcomemail(user.email,user.name)
         const token=await company.generateAuthToken()
         res.cookie('auth',token,{
            expires:new Date(Date.now()+600000000),
            httpOnly:true
        })
         res.status(201).send({company,token})
     }catch(e){
 
             res.status(400).send(e)
     }
 })
 router.get('/company/me',auth,async (req,res)=>{
    res.send(req.company)
})

router.post('/company/login',async (req,res)=>{

    try{
        
        const company=await Company.findByCredentials(req.body.email,req.body.password)
       const token=await company.generateAuthToken()
       res.cookie('auth',token,{
        expires:new Date(Date.now()+600000000),
        httpOnly:true
    })
        res.send({company,token})
    }catch(e){
        res.status(400).send(e)

    }

})

router.post('/company/logout',auth,async (req,res)=>{
    try{

        console.log(req.token)
        req.company.tokens=req.company.tokens.filter((token)=>{
            return token.token!==req.token
        })
        await req.company.save()

        res.send(req.company)
    }catch(e){

        res.status(500).send(e)

    }

})



router.patch('/company/me',auth,async(req,res)=>{
    try{

        const updates=Object.keys(req.body)
        const allow=['name','email','password']
        const isvalid=updates.every((update)=>allow.includes(update))
        if(!isvalid)
        {
            return res.status(401).send({error:'Invalid updates!'})
        }
        
       /* const user=await User.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true
            
        })*/
        updates.forEach((update)=>{
            req.company[update]=req.body[update]
        })
        await req.company.save()
        

        res.send(req.company)

    }catch(e){
        res.status(401).send(e)
    }
})

router.delete('/company/me',auth,async (req,res)=>{
    try{

        // const user= await User.findByIdAndDelete(req.user._id)
        

        await req.company.remove()
      //  sendcancelationemail(req.user.email,req.user.name)
        res.send(req.company)
    }catch(e){
        res.status(500).send('e',e)

    }
})
/*
const upload=multer({
    
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){

        if(!file.originalname.match(/\.(jpg|jpeg|png)$/))
        {
            return cb(new Error('please upload a image'))
        }

        cb(undefined,true)
    }
})

router.post('/users/me/avatar',auth,upload.single('avatar'),async (req,res)=>{
   const buffer=await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
    req.user.avatar=buffer
   await req.user.save()

    res.send()
},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
})

router.delete('/users/me/avatar',auth,async (req,res)=>{
    req.user.avatar=undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar',async (req,res)=>{
    try{

        const user=await User.findById(req.params.id)
        if(!user||!user.avatar){
            throw new Error()

        }
        res.set('Content-Type','image/png')
        res.send(user.avatar)

    }catch(e){
        res.status(404).send()
    }
})
*/

module.exports=router