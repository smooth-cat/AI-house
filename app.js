const mysql = require('mysql')
const express = require('express')
const bodyParser = require('body-parser')
const {set_lights, login, register, getTempDamp, shutdown,get_instruct,set_instruct } = require('./hanler')//
const app = express()
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }))

/*------------动态请求-------------*/
app.get('/node/temp_damp', async (req, res) => {//响应实时温度请求
   //  console.log(req.query);
    var temp_damp = await getTempDamp(pool, req.query.name)
    res.send(JSON.stringify(temp_damp));
})

app.post('/node/user/login', async (req, res) => {//响应登录请求
    var answer = await login(pool, req.body)
    var str = JSON.stringify(answer)
    console.log('response:', str);
    res.send(str)
})

app.post('/node/user/register', async (req, res) => {//响应注册请求
   var answer = await register(pool, req.body)
   var str = JSON.stringify(answer)
   console.log('response:', str);
   res.send(str)
})

app.post('/node/ac/get_instruct',async (req,res)=>{//发送上一次退出前空调指令
   var promise= get_instruct(pool,req.body.name)
   promise.catch(err=>console.log(err))
   var instruct=await promise
   // console.log(instruct)
   res.send(JSON.stringify(instruct))
})

app.post('/node/ac/set_instruct',async (req,res)=>{//响应空调指令
   var promise=set_instruct(pool,req.body)
   promise.catch(err=>console.log(err))
   await promise
   console.log('接倒空调设置:',req.body)
   res.send(JSON.stringify({a:'哈哈',b:'嘿嘿'}))
})

app.post('/node/set_light',async(req,res)=>{//接受灯设置
   // console.log('接到灯设置:',req.body)
   var promise=set_lights(pool,req.body)
   promise.catch(err=>console.log(err))
   await promise
   res.send('接收到灯变化')
})




app.get('/node/shutdown', (req, res) => {//响应用户退出请求
    console.log('执行到shutdown');
    var result = shutdown(pool, req.query);
    res.send(result);
})


/*------------连接数据库 ------------*/
var pool = mysql.createPool({//创建连接池
    connectionLimit: 15,
    host: 'localhost',
    user: 'root',
    password: 'mysql',
    database: 'test'
});

/*-------------监听9000端口---------------*/
app.listen(9000, () => {//
    console.log('服务器已经启动');

})


//静态资源处理 将/public/映射到./public/目录 这部分用nginx代替
// app.use('/public/',express.static('./public/'))
















// var user = {
//         id: 24,
//         name: 'hellow',
//         password: '123456',
//         state: '0',
//         avater: null,
//         temperature1: 26.5
//     }

// //操作数据库
// //1.引入mok
// var mysql = require('mysql');
// var { update, insert, del, search }=require('./mysqlOpr');
//2.创建连接池
// var pool = mysql.createPool({
//     connectionLimit: 15,
//     host: 'localhost',
//     user: 'root',
//     password: 'mysql',
//     database: 'test'
// });
// var pool3 = 123;
// search(pool, user)
//     .then(
//         res => {console.log(res);pool.end();},
//         err => console.log(err)
    // )


