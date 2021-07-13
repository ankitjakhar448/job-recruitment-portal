const jwt=require('jsonwebtoken')
const Company = require('../models/company')


const auth= async (req,res,next)=>{
    try{
        const token=req.cookies.auth
        
        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        const company=await Company.findOne({_id:decoded._id,'tokens.token':token})
        console.log('tokens',company.tokens)
        if(!company)
        {
            throw new Error()
        }
        req.token=token
        req.company=company
        next()

    }catch(e){
        res.status(401).send( {error: 'Please authenticate'})
    }
    
}

module.exports=auth