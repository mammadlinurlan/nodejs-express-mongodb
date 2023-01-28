const mongoose = require('mongoose')
const schema = mongoose.Schema;

const brandSchema = new schema(
    {
        name:{
            type:String,
            require:true,
            unique:true
        },
        phones:[{
            type:schema.Types.ObjectId,
            ref:"Phone"
        }]
    }
)

const Brand = mongoose.model('Brand',brandSchema);
module.exports = Brand
