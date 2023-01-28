const mongoose = require('mongoose')
const schema = mongoose.Schema

const productSchema = new schema({
    name:{
        type:String
    },
    price:{
        type:Number
    },
    stock:{
        type:Number
    },
    image:{
        type:String
    }

},{timestamps:true})

const Product = mongoose.model('Product',productSchema)
module.exports = Product 