const mongoose=require('mongoose')
const validator=require('validator')

const portfolioschema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    bio:{
        type:String,
        trim:true
    },
    
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        unique:true,
        ref:'User'
    }

},{
    timestamps:true
})


const Portfolio=mongoose.model('Portfolio',portfolioschema)

module.exports=Portfolio