const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const schema = mongoose.Schema

const orderSchema = new schema({
    orderItems : [],

    status:{
        type : Number,
        default : 1
    },
    date:{
        type:Date,
        default:Date.now
    },
    address : {
        type:String,
        required : true
    },
    name : {
        type:String,
        required : true
    },
      surname : {
        type:String,
        required : true
    },  
    city : {
        type:String,
        required : true
    }, 
     state : {
        type:String,
        required : true
    },
    zip : {
        type:String,
        required : true
    },
    phone : {
        type:String,
        required : true
    },
    totalPrice : {
        type: Number,
        required : true
    }
},{timestamps:true})



const Order = mongoose.model('Order',orderSchema);
module.exports = Order