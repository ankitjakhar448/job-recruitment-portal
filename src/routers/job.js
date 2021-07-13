const express = require('express')
const Job = require('../models/job')
const auth=require('../middleware/companyauth')
const router = new express.Router()

router.post('/jobs',auth, async (req, res) => {
    

    const job=new Job({
        ...req.body,
        owner:req.company._id
    })

    try {
        await job.save()
        res.status(201).send(job)
    } catch (e) {
        res.status(400).send(e)
    }
})

//GET /tasks?limit=10&skip=0
//GET /tasks?sortBy=createdAt_asc
router.get('/jobs',auth, async (req, res) => {

    
   
    const sort={}
    
    
    if(req.query.sortBy)
    {
        const parts=req.query.sortBy.split(':')
        sort[parts[0]]=parts[1]==='desc'?-1:1
    }

    //console.log(req.user)
    try {
        
        await req.company.populate({
            path:'jobs',
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        
        res.send(req.company.jobs)
       
        
    } catch (e) {
        res.status(500).send(e)
    }
})
router.get('/jobs/all', async (req, res) => {

    try {
        
        
        
        const jobs=await Job.find()
        res.send(jobs)
       
        
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/jobs/user/:id', async (req, res) => {

    try {
        
        
        
        const jobs=await Job.findById(req.params.id)
        res.cookie('jobid',jobs._id,{
            expires:new Date(Date.now()+600000000),
            httpOnly:true
        })
        res.redirect('/jobfindone')
       
        
    } catch (e) {
        res.status(500).send(e)
    }
})
router.get('/jobs/findone', async (req, res) => {

    try {
        
        
        const id=req.cookies.jobid
        const jobs=await Job.findById(id)
        await jobs.populate({
            path:'owner'
        }).execPopulate()

        
        res.send(jobs)
       
        
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/jobs/:id',auth, async (req, res) => {
    const _id = req.params.id

    try {
      
        const job=await Job.findOne({_id,owner:req.company._id})

        if (!job) {
            return res.status(404).send()
        }

        res.send(job)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/jobs/:id',auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['titel', 'dis']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const job = await Job.findOne({_id:req.params.id,owner:req.company._id})

        

        if (!job) {
            return res.status(404).send()
        }

        updates.forEach((update) => job[update] = req.body[update])
        await job.save()
        res.send(job)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/jobs/:id',auth, async (req, res) => {
    try {
        const job = await Job.findOneAndDelete({_id:req.params.id,owner:req.company._id})

        if (!job) {
            res.status(404).send()
        }

        res.send(job)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router