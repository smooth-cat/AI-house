const mysql = require('mysql')
const express = require('express')
const bodyParser = require('body-parser')
const { logReg,getTemperature,shutdown } = require('./hanler')//
const app = express()
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }))

/*------------动态请求-------------*/
app.get('/node/temperature', async(req, res) => {//响应实时温度请求
    console.log(req.query);
    var temperature=await getTemperature(pool,req.query)
    res.send(temperature.toString());
})

app.post('/node/user/insert',async (req, res) => {//响应表单请求
    try {
        var answer= await logReg(pool,req.body)
        var str=JSON.stringify(answer)
        console.log('response:', str);
        res.send(str)
    } catch (error) {
        res.send(error.message)
    }
})

app.get('/node/shutdown',(req,res)=>{//响应关闭检测温度
    console.log('执行到shutdown');
    var result=shutdown(pool,req.query);
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


