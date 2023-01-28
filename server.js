// const http = require('http');
// const fs = require('fs')
// const _ = require('lodash')
// const server = http.createServer((req,res)=>{
//     console.log(req.url,req.method)

//     res.setHeader('Content-Type','text-html')
//     let path = './';
//     switch(req.url){
//         case '/' :
//             path += 'index.html'
//             res.statusCode = 200
//             break;
//         case '/about' :
//             path += 'about.html'
//             res.statusCode = 200

//             break;
//         default:
//             path += '404.html'
//             res.statusCode = 404


//     }
//     fs.readFile(path ,(err,data)=>{
//         if(err){
//             console.log(err);
//             res.end()
//         }else{
//             res.write(data);
//             res.end();
//         }
//     })
// });

// server.listen(3000,'localhost',()=>{
//     console.log('3000 port listening')
// })
// const nums = [1,4,6,23]

// _.each(nums,(val,keys)=>{
//     console.log(keys)
// })

// let random =  _.random(0,30)
// console.log(random)