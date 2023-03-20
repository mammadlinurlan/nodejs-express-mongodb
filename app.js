const express = require('express');
const morgan = require('morgan');
const bcrypt = require('bcrypt')
const Phone = require('./models/phones')
const User = require('./models/users')
const Brand = require('./models/brands')
const Product = require('./models/products')
const multer = require('multer')
var fs = require('fs');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname)
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/webp') {
        cb(null, true);
    } else {
        cb(null, false);
    }

}

var upload = multer({
    storage: storage,
    fileFilter: fileFilter
});



const PORT = process.env.PORT || 3000
const app = express();
const cors = require('cors');
const mongoose = require('mongoose')
const dbUrl = 'mongodb+srv://Nurlanmle:Nurlan123@cluster0.wqiztao.mongodb.net/?retryWrites=true&w=majority'
const maxAge = 60 * 60 * 24
const jwt = require('jsonwebtoken')
const { requireauth } = require('./middlewares/authMiddleware')
const JWT_SECRET =
    "goK!pusp6ThEdURUtRenOwUhAsWUCLheBazl!uJLPlS8EbreWLdrupIwabRAsiBu";
const createToken = (id) => {
    return jwt.sign({ id }, 'secretkey', { expiresIn: maxAge }, process.env.JWT_TOKEN_SECRET)
}
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((res) => {
        console.log('connected')
    }).catch((err) => {
        console.log(err)
    })
app.set('view engine', 'ejs')
app.listen(PORT, '0.0.0.0', () => {
    console.log(`connected on port ${PORT}`)
})

app.use(express.static('public'))
app.use(morgan('dev'))
const cookieParser = require('cookie-parser');
const { result } = require('lodash');
const Order = require('./models/orders');
app.use(cookieParser());
app.use(cors({ credentials: true, origin: ["takehiq.netlify.app", "https://takehiq.netlify.app", "https://master--zippy-rolypoly-67da9b.netlify.app", ",http://localhost:3001", "http://localhost:3000", "http://www.safbal.az", "http://localhost:3001"] }));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

app.use(express.static('uploads'));
app.use('/uploads', express.static('uploads'));

app.post('/login', async (req, res) => {
    const { username, password } = req.body
    console.log(req.body)
    try {
        const user = await User.login(username, password)
        console.log(user._id)
        const token = createToken(user._id)
        console.log(`girildi , tokeni : ${token} , adi : ${user.username}`);
        res.cookie('jwt', token, {
            httpOnly: true, maxAge: maxAge * 1000, sameSite: "none",
            secure: true, domain: 'takehiq.netlify.app'
        })

        const IUser = {
            _id: user._id,
            username: user.username,
            email: user.email,
            isadmin: user.isadmin,
            basket: user.basket,
            orders: user.orders
        }
        res.status(200)
        res.send(IUser)
    }
    catch (e) {
        res.status(400).sendStatus(400)
        console.log(e)
    }
})

app.put('/orderstatus', (req, res) => {
    console.log(Number(req.query.status))
    Order.updateOne({ _id: req.query.orderId }, { $set: { 'status': Number(req.query.status) } })
        .then((r) => {
            User.findOne({ _id: req.query.userId }, (err, user) => {
                const selectorder = user.orders.find((o) => o._id == req.query.orderId)
                selectorder.status = Number(req.query.status);
                user.orders = user.orders.filter((i) => i._id != req.query.orderId)
                user.orders.push(selectorder)
                User.updateOne({ _id: req.query.userId }, { $set: { 'orders': user.orders } })
                    .then((obj) => {
                        Order.find()
                            .then((result) => {
                                res.send(result)
                            })
                        // res.send()
                    })
                    .catch((err) => {
                        res.sendStatus(401)
                    })
            })
        })
        .catch((err) => {
            res.send(err)
        })
})

app.get('/cookietest', (req, res) => {
    res.cookie('testcookie', 'salamlar')
    res.send('salam')
})

app.get('/addphone', (req, res) => {
    // let brandid = '';
    // Brand.findOne({name:"Apple"})
    // .then((result)=>{
    //     brandid = result._id
    //     res.send(brandid)
    // })

    const phone = new Phone({
        model: "iPhone X pro",
        ram: 10,
        img: 'https://www.best.com.kw/wcsstore/BEST/images/IPH-13-128GB-BLUE-0.jpg',
        price: 330,
        color: 'Green',
        memory: 256,
        brand: '6346e14211e1dc6e2648ccfe'
    })
    phone.save()
        .then((r) => {
            Brand.findOne({ _id: phone.brand }, (err, brand) => {
                brand.phones.push(phone)
                brand.save()
                res.sendStatus(200)
            })

        })
        .catch((err) => {
            res.sendStatus(400)
        })





})

app.post('/postimage', upload.single('image'), (req, res) => {
    // console.log(req.body.dadasurname)
    // console.log(req.body)
    if (!req.file) {
        res.sendStatus(500)
    }
    else {
        console.log(req.file.destination)
        res.sendStatus(200)
    }
})

app.post('/addproduct', upload.single('image'), (req, res) => {

    if (!req.file || req.body.name == '' || Number(req.body.price) == 0) {
        console.log(req.body)
        if (req.file) {
            fs.unlink(`./${req.file.path}`, function (err) {
                if (err) return console.log(err);
                console.log('file deleted successfully');
            })
        }

        res.sendStatus(400)
        return
    }
    const product = new Product({
        name: req.body.name,
        price: Number(req.body.price),
        stock: Number(req.body.stock),
        image: req.file.path
    })
    product.save().then((r) => {
        res.sendStatus(200)
    })
        .catch((err) => {
            res.sendStatus(400)
        })
})

app.put('/updateproduct/:productId', upload.single('image'), (req, res) => {
    console.log(req.body)
    console.log(req.file)
    const productId = req.params.productId
    if (req.body.name == '' || Number(req.body.price) == 0) {
        res.sendStatus(400)
        return
    }
    console.log(productId)

    Product.findOne({ _id: productId }, (error, prod) => {
        prod.name = req.body.name
        prod.stock = Number(req.body.stock)
        prod.price = Number(req.body.price)
        if (req.file) {
            fs.unlink(`./${prod.image}`, function (err) {
                if (err) return console.log(err);
                console.log('file deleted successfully');
            })
        }
        prod.image = req.file ? req.file.path : prod.image

        prod.save().then((r) => {
            res.sendStatus(200)
        })
            .catch((err) => {
                res.sendStatus(400)
            })

    })


})

app.delete('/deleteproduct/:itemId', (req, res) => {
    const { itemId } = req.params
    Product.findOneAndDelete({ _id: itemId }, (err, prod) => {
        Product.find()
            .then((r) => {
                res.send(r)
            })
    })
})

app.delete('/deleteuser/:userId', (req, res) => {
    const { userId } = req.params
    User.findOneAndDelete({ _id: userId }, (err, user) => {
        if (err) {
            res.sendStatus(500)
        }
        else {
            res.sendStatus(200)
        }
    })
})

app.put('/giverole/:userId', (req, res) => {
    const { userId } = req.params
    User.findOne({ _id: userId }, (err, u) => {
        User.findOneAndUpdate({ _id: userId }, { $set: { isadmin : !u.isadmin  } })
        .then(()=>{
            res.sendStatus(200)
        })
        .catch(()=>{
            res.sendStatus(401)
        })
    })
})

app.get('/searchproducts/:searchString', (req, res) => {
    const { searchString } = req.params
    let products;
    Product.find()
        .then((result) => {
            products = result.filter((p) => p.name.toLowerCase().trim().includes(searchString.toLowerCase().trim()))
            res.send(products)
        })
})

app.post('/testprodimg', upload.single('image'), (req, res) => {
    console.log(req.file)
})

app.get('/getproduct/:phoneId', (req, res) => {
    const { phoneId } = req.params
    Product.findOne({ _id: phoneId }, (err, prod) => {
        res.send(prod)
    })
})


app.get('/getallproducts/:page', (req, res) => {
    const { page } = req.params
    console.log(page)

    Product.find()
        .then((result) => {

            const resObj = {
                data: result.reverse().slice((page - 1) * 4, (page - 1) * 4 + 4),
                totalPage: result.length
            }
            setTimeout(() => {
                res.send(resObj)

            }, 1000);
        })
})

app.get('/fortype', (req, res) => {
    Product.find()
        .then(result => {
            res.send(result)
        })
})

app.get('/users', (req, res) => {
    User.find()
        .then(result => {
            res.send(result)
        })
})


app.get('/getimage', (req, res) => {
    // res.sendFile('./uploads/dagbali.jpg')
    res.contentType('jpg')
    res.sendFile('./uploads/dagbali.jpg', { root: __dirname });
})




// app.get('/add',(req,res)=>{
//     const brand = new Brand({
//         name:"Sony"
//     })
//     brand.save().then((r)=>{
//         res.status(200).sendStatus(200)
//     })
//     .catch((err)=>{
//         res.status(400).sendStatus(400)
//     })
// })

app.get('/all', (req, res) => {
    Phone.find()
        .then((result) => {
            res.send(result)
        })
})
app.get('/allbrands', (req, res) => {
    Brand.find()
        .then((result) => {
            res.send(result)
        })
})

app.get('/deletebrand', (req, res) => {
    Brand.findOne({ name: "Sony" }, (err, brand) => {
        brand.phones = [];
        brand.save()
        res.sendStatus(200)
    })
})

app.get('/allphones', (req, res) => {
    Phone.find()
        .then((result) => {
            res.send(result)
        })
})

app.get('/brands', (req, res) => {
    Brand.find()
        .then((result) => {
            res.send(result)
        })
})

app.get('/spec/:id', (req, res) => {
    const id = req.params.id
    Brand.findOne({ _id: id })
        .then((result) => {
            res.send(result)
        })

})

// app.get('/deleteusers',(req,res)=>{
//     User.deleteMany()
//     .then((result)=>{
//         res.send(result)
//     })
// })

app.get('/phone/:id', (req, res) => {
    const id = req.params.id;

    Phone.findById(id)
        .then((data) => {
            res.send(data)
        })
        .catch((err) => {
            console.log(err)
        })
})

app.get('/allusers', (req, res) => {
    User.find()
        .then((result) => {
            res.send(result)
        })
})

app.post('/postphone', (req, res) => {

    const newPhone = new Phone(req.body);
    // console.log(newPhone)
    // Brand.findOne({_id:newPhone.brand},(err,brand)=>{
    //     console.log(brand)
    // })
    newPhone.save()
        .then((result) => {
            Brand.findOne({ _id: `${req.body.brand}` }, (err, brand) => {
                brand.phones.push(newPhone)
                brand.save()
                res.sendStatus(200)
                // console.log(brand)
            })
        })
        .catch((err) => {
            res.sendStatus(401)

        })
})

app.get('/testuser', (req, res) => {
    User.findOne({ username: 'nurlan' }, (err, user) => {
        res.send(user)
    })
})

app.get('/getbasket/:userid', (req, res) => {
    //    res.send(req.body)
    const userid = req.params.userid
    User.find({ _id: userid }, (err, user) => {
        res.send(user.basket)
    })
})
app.put('/updatebasket/:id', (req, res) => {
    const id = req.params.id;
    console.log(req.body)
    User.updateOne({ _id: id }, { $set: { 'basket': req.body } })
        .then((obj) => {
            res.sendStatus(200)
        })
        .catch((err) => {
            res.sendStatus(401)
        })
})

app.get('/clearuser', (req, res) => {
    User.findOne({ username: '111' }, (err, user) => {
        user.basket = []
        user.orders = []
        user.save()
        res.sendStatus(200)
    })
})

app.get('/userbasket', (req, res) => {
    User.find({ username: 'nunu999' }, (err, user) => {
        res.send(user)
    })

})

app.post('/makeorder/:userId', (req, res) => {
    const id = req.params.userId
    console.log(id)
    console.log(req.body)
    User.findOne({ _id: id }, (err, user) => {

        if (user.basket.length == 0) {
            res.sendStatus(401)
            return
        }
        const order = new Order(req.body)
        user.orders.push(order)
        user.basket = []
        user.save();
        order.save()
        res.sendStatus(200)

    })

})

app.get('/getuser/:id', (req, res) => {
    const id = req.params.id
    console.log(id)
    User.findOne({ _id: id }, (err, user) => {
        const IUser = {
            _id: user._id,
            username: user.username,
            email: user.email,
            isadmin: user.isadmin,
            basket: user.basket,
            orders: user.orders
        }
        res.send(IUser)
    })
})


app.post('/addtobasket', (req, res) => {

    const basketItem = {
        _id: req.body._id,
        image: req.body.image,
        name: req.body.name,
        price: req.body.price,
        count: req.body.count,
    }

    console.log(basketItem)
    console.log(`userid is : ${req.body.userId}  ,  product is : ${req.body.name}`)

    const userId = req.body.userId
    console.log(userId)
    User.findOne({ _id: userId }, (err, user) => {
        if (user) {
            if (user.basket.some((item) => item._id == req.body._id)) {
                const existprod = user.basket.find((item) => item._id == req.body._id)
                console.log('exist prod' + existprod._id)
                const newcount = user.basket.find((item) => item._id == req.body._id).count + 1
                console.log('new count is : ' + newcount)
                const basket = user.basket.filter((item) => item._id != req.body._id)
                const replacer = {
                    _id: req.body._id,
                    count: newcount,
                    image: req.body.image,
                    name: req.body.name,
                    price: req.body.price,
                }
                basket.push(replacer)
                console.log('old basket is' + user.basket)

                console.log('new basket is ' + basket)
                User.updateOne({ _id: req.body.userId }, { $set: { 'basket': basket } })
                    .then((obj) => {
                        console.log(`updated : ${obj}`)
                    })
                    .catch((err) => {
                        console.log('Error: ' + err);
                    })
                res.send(basket)
            }
            else {
                user.basket.push(basketItem)
                user.save();
                res.send(user.basket)
            }
        }
        else {
            res.sendStatus(401)
        }
    })




    // console.log(basketItem)
})

app.get('/specialbasket', (req, res) => {
    User.findOne({ username: 'nurlan' }, (err, user) => {
        res.send(user.basket)
    })
})

// app.put('/addtobasket',(req,res)=>{

// })

app.post('/postuser', (req, res) => {

    const newUser = new User(req.body);
    console.log(newUser)
    newUser.save()
        .then((result) => {
            res.status(200).sendStatus(200)
        })
        .catch((err) => {
            res.status(400).sendStatus(400)

        })
})



app.get('/logout', (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.sendStatus(200)
})

app.get('/test', (req, res, next) => {
    const token = req.cookies.jwt;
    console.log(req.cookies)
    console.log('tokeni budu' + token)
    if (token) {
        jwt.verify(token, 'secretkey', (err, decoded) => {
            if (err) {
                console.log(err);
                res.sendStatus(401);
            }
            else {
                res.send(decoded.id)
            }
        })
    }
    else {
        res.sendStatus(404)
    }
})

app.get('/testadmin', (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, 'secretkey', (err, decoded) => {
            if (err) {
                console.log(err)
                res.sendStatus(401)
            }
            else {
                User.findOne({ _id: decoded.id }, (err, user) => {
                    user.isadmin ? res.sendStatus(200) : res.sendStatus(201)
                })
            }
        })
    }
    else {
        res.sendStatus(404)
    }
})

app.get('/orders', (req, res) => {
    Order.find()
        .then((result) => {
            res.send(result)
        })
        .catch((err) => {
            res.send(err)
        })
})

app.post('/admin', async (req, res) => {
    const { username, password } = req.body
    console.log(req.body)
    try {
        const user = await User.adminlogin(username, password)
        console.log(user._id)
        const token = createToken(user._id)
        console.log("token", token);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
        res.sendStatus(200)
    }
    catch (e) {
        res.status(400).sendStatus(400)
        console.log(e)
    }
})


app.put('/update/:id', (req, res) => {
    const id = req.params.id
    // console.log(req.body.brand)
    Phone.findOne({ id: req.params.id }, (err, phone) => {
        const oldBrandId = phone.brand
        if (req.body.brand === phone.brand) {
            // console.log("deyismedi")
            Phone.findByIdAndUpdate(id, req.body)
                .then((result) => {
                    res.sendStatus(200)
                })
                .catch((err) => {
                    res.sendStatus(401)

                })
        }
        else {
            Phone.findByIdAndUpdate(id, req.body)
                .then((result) => {
                    Brand.findOne({ _id: req.body.brand }, (err, brand) => {
                        brand.phones.push(phone);
                        brand.save()

                    })
                    Brand.findOne({ _id: oldBrandId }, (err, brand) => {
                        brand.phones = brand.phones.filter((p) => p.toString() != phone._id.toString())
                        brand.save()
                    })
                    res.sendStatus(200)

                })
                .catch((err) => {
                    res.sendStatus(401)

                })
        }
    })
    // console.log(req.body)


})


app.delete('/deletephone/:id', (req, res) => {
    const id = req.params.id
    Phone.findOneAndDelete({ _id: id }, (err, phone) => {
        Brand.findOne({ _id: phone.brand }, (error, brand) => {
            brand.phones = brand.phones.filter((p) => p.toString() != phone._id.toString())
            brand.save()
            res.sendStatus(200)
        })
    })

    // Phone.findByIdAndDelete(id)
    // .then((result)=>{
    //     Brand.findOne({_id:})
    //     res.sendStatus(200)
    // })
    // .catch((err)=>{ 
    //     res.sendStatus(400)
    // })
})

app.get('/', (req, res) => {
    res.render('index', { title: 'HomePage' })
})

app.get('/about', (req, res) => {
    res.render('about')
})

// app.get('/login', (req, res) => {
//     res.render('login')
// })

app.use((req, res) => {
    res.status(400).render('404')
})