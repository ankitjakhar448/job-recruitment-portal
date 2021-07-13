const mongoose=require('mongoose')
const validator=require('validator')


const applyschema=new mongoose.Schema({

    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    job:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Job'
    }

},{
    timestamps:true
})


const Apply=mongoose.model('Apply',applyschema)

module.exports=Apply