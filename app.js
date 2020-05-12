const mysql = require('mysql')
const express = require('express')
const bodyParser = require('body-parser')
const {set_lights, login, register, getTempDamp, shutdown,get_instruct,set_instruct } = require('./hanler')//
const app = express()
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }))

/*------------动态请求-------------*/


app.post('/node/user/login', async (req, res) => {//响应登录请求
    var answer = await login(pool, req.body)
    console.log('response:', answer);
    res.json(answer)
})

app.post('/node/user/register', async (req, res) => {//响应注册请求
   var answer = await register(pool, req.body)
   console.log('response:', answer);
   res.json(answer )
})

app.get('/node/shutdown',async (req, res) => {//响应退出请求
   console.log('执行到shutdown');
   await shutdown(pool, req.query.name);
   res.send('已退出');
})

app.get('/node/temp_damp', async (req, res) => {//响应实时温度/湿度请求
   var temp_damp = await getTempDamp(pool, req.query.name)
   res.json(temp_damp)
})

app.get('/node/get_ac_lights',async (req,res)=>{//获取数据库中空调指令和灯
   var instruct=await get_instruct(pool,req.query.name)
   console.log('发送初始设置:', instruct)
   res.json(instruct)
})

app.post('/node/set_ac',async (req,res)=>{//设置空调状态
   // console.log('接到空调设置:',req.body)
   await set_instruct(pool,req.body)
   res.send('空调设置成功')
})

app.post('/node/set_lights',async(req,res)=>{//设置灯状态
   console.log('接到灯光设置:',req.body)
   await set_lights(pool,req.body)
   res.send('灯光设置成功')
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


