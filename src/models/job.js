const mongoose=require('mongoose')
const validator=require('validator')

const jobschema=new mongoose.Schema({
    titel:{
        type:String,
        required:true,
        trim:true
    },
    dis:{
        type:String,
        required:true,
        trim:true
    },

    
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Company'
    }

},{
    timestamps:true
})


const Job=mongoose.model('Job',jobschema)

module.exports=Job