const { ObjectID } = require('bson')
const express=require('express')
const User=require('../models/user')
const Portfolio=require('../models/portfolio')
const auth=require('../middleware/auth')
const multer=require('multer')
const sharp=require('sharp')
const {sendwelcomemail,sendcancelationemail}=require('../emails/account')

const router=new express.Router()

//new user register
router.post('/users',async (req,res)=>{
    const user=new User(req.body)
     try
     {
         await user.save()
        // sendwelcomemail(user.email,user.name)
         const token=await user.generateAuthToken()
         res.cookie('auth',token,{
             expires:new Date(Date.now()+600000000),
             httpOnly:true
         })

         const portfolio=new Portfolio({name:req.body.name,owner:user._id})
         await portfolio.save()
         res.status(201).send({user,token,portfolio})
     }catch(e){
 
             res.status(400).send(e)
     }
 })
router.get('/user/islogin',auth,async (req,res)=>{
    try{
        res.status(200).send(req.user)

    }catch(e){
        res.status(400).send(e);
    }
})

 router.get('/users/me',auth,async (req,res)=>{
     try{
    res.send(req.user)
     }catch(e){
         res.redirect('/')
     }
})


//user login
router.post('/users/login',async (req,res)=>{

    try{
        
        const user=await User.findByCredentials(req.body.email,req.body.password)
       const token=await user.generateAuthToken()
       res.cookie('auth',token,{
        expires:new Date(Date.now()+600000000),
        httpOnly:true
    })
    res.redirect('/')
        //res.send(user)
    }catch(e){
        res.status(400).send("no no no")

    }

})

router.post('/users/logout',auth,async (req,res)=>{
    try{

        req.user.tokens=req.user.tokens.filter((token)=>{
            return token.token!==req.token
        })
        await req.user.save()

        res.redirect('/')
    }catch(e){

        res.status(500).send(e)

    }

})



router.post('/users/follows/:id',auth,async (req,res)=>{
    try{

        req.user.follows=req.user.follows.concat({company:req.params.id})
        await req.user.save()

        res.send('follows')
    }catch(e){

        res.status(500).send(e)

    }

})



router.patch('/users/me',auth,async(req,res)=>{
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
            req.user[update]=req.body[update]
        })
        await req.user.save()
        

        res.send(req.user)

    }catch(e){
        res.status(401).send(e)
    }
})

router.delete('/users/me',auth,async (req,res)=>{
    try{

        // const user= await User.findByIdAndDelete(req.user._id)
        

        await req.user.remove()
      //  sendcancelationemail(req.user.email,req.user.name)
        res.send(req.user)
    }catch(e){
        res.status(500).send('e',e)

    }
})

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


module.exports=router