const mongoose = require('mongoose')
const schema = mongoose.Schema

const phoneSchema = new schema({
    brand:{
        type:String
    },
    model:{
        type:String,
        require:true
    },
    ram:{
        type:Number,
        require:true
    },
    img:{
        type:String,
        require:true
    },
    price:{
        type:Number,
        require:true
    },
    color:{
        type:String,
        require:true
    },
    memory:{
        type:Number,
        require:true
    } 
},{timestamps:true})

const Phone = mongoose.model('Phone',phoneSchema);
module.exports = Phone
