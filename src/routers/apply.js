const express = require('express')
const Apply = require('../models/apply')
const auth=require('../middleware/auth')
const router = new express.Router()

router.post('/apply/:id',auth, async (req, res) => {
    try {
    const ap=await Apply.find({user:req.user._id,job:req.params.id})
    if(ap)
    {
        console.log("you allready applied")
        throw new Error("you allready applied")
    }
    

    const apply=new Apply({user:req.user._id,job:req.params.id})

   
        await apply.save()
        res.status(201).send(apply)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/apply',auth, async (req, res) => {
    

    const apply=await Apply.find()

    try {
        
        res.status(201).send(apply)
    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router