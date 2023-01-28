const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const schema = mongoose.Schema

const userSchema = new schema({
    username:{
        type:String,
        require:true,
        unique:true
    },
    password:{
        type:String,
        require:true
    },
    confirmpassword:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true,
        unique:true
    },
    isadmin:{
      type:Boolean,
      default:false
    }
    ,
    date:{
        type:Date,
        default:Date.now
    },
    basketItems:[
        {
            itemId:String,
            count:Number
        }
    ]
    ,
    basket:[

    ],
    orders:[
        {
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
        }
    ]
},{timestamps:true})

userSchema.statics.login = async function(username,password){
    const user =await this.findOne({username})
    if(user){
        // const auth = await bcrypt.compare(password,user.password)
        if(user.password == password){
            return user
        }
        else{
            throw Error('incorrect password')
        }
    }
    else
    {
        throw Error('User not found')
    }
}

userSchema.statics.adminlogin = async function(username,password){
    const user =await this.findOne({username})
    if(user){
        if(user.isadmin)
        {
            const auth = await bcrypt.compare(password,user.password)
            if(auth){
                return user
            }
            else{
                throw Error('incorrect password')
            }
        }
        else{
            throw Error('you are not admin')
        }
       
    }
    else
    {
        throw Error('User not found')
    }
}

// userSchema.pre('save',async function(next){
//     const salt =await bcrypt.genSalt();
//     this.password = await bcrypt.hash(this.password,salt)
//     next()
// })

const User = mongoose.model('User',userSchema);
module.exports = User