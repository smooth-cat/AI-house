module.exports = { update, insert, del, search }
function getConnect(pool) {
    //Promise构造方法
    return new Promise((resolve, reject) => {
        pool.getConnection(function (err, connection) {
            if (err) {
                reject(err);
            } else {
                resolve(connection);
            }
        })
    })
}
function keyVal(user){
    var keys=[]
    var vals=[]
    for(var key in user){
        keys.push(key);
        vals.push(user[key]);
    }
    return {keys,vals}
}
//增
function insert(pool, user) {
    return new Promise(async (resolve, reject) => {
        try {
            var kv=keyVal(user);
            var fields=kv.keys.join(',')
            var hints=new Array(kv.keys.length+1).join('?,')
            hints=hints.substring(0,hints.length-1);
            var connection = await getConnect(pool);
            connection.query(`insert into webuser 
            (${fields}) 
            values(${hints});`,kv.vals,(err, res) => {
                if (err)
                    reject(err);
                else
                    resolve(res);
            })
            connection.release();
        } catch (error) {
            console.log('连接失败');
        }
    })
}
//删
function del(pool, user) {
    return new Promise(async (resolve, reject) => {
        try {
            var connection = await getConnect(pool);
            connection.query(`delete from webuser where id=${user.id};`, (err, res) => {
                if (err)
                    reject(err);
                else
                    resolve(res);
            })
            connection.release();
        } catch (error) {
            console.log('连接失败');
        }
    })
}
//改
function update(pool, user,accord) {//池，字段，值
    return new Promise(async (resolve, reject) => {
        try {
            var kv=keyVal(user);
            var couples=kv.keys.join('=?,')+'=?'
            var connection = await getConnect(pool)
            var condition=keyVal(accord)
            kv.vals.push(condition.vals[0])
            connection.query(`update webuser set 
            ${couples}
            where ${condition.keys[0]}=?;`,kv.vals, (err, res) => {
                if (err)
                    reject(err);
                else
                    resolve(res);
            })
            connection.release();
        } catch (error) {
            console.log(error);
        }
    })
}
//查
function search(pool, user,accord) {
    return new Promise(async (resolve, reject) => {
        try {
            var fields=keyVal(user).keys.join(',')
            // console.log(fields);
            var connection = await getConnect(pool);
            var condition=keyVal(accord)
            connection.query(`select ${fields} from webuser 
            where ${condition.keys[0]}=?`,[condition.vals[0]], (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            })
            connection.release();
        } catch (error) {
            console.log('连接失败');
        }
    })
}


// user = {
//     state: 1,
//     temperature1: 40
// }
// accord={state:1}
// var kv=keyVal(user);
// var couples=kv.keys.join('=?,')+'=?'
// var condition=keyVal(accord)
// console.log(`update webuser set 
// ${couples}
// where ${condition.keys[0]}=?;`);
// kv.vals.push(5)
// console.log(kv.vals)

// var mysql = require('mysql');
// var pool = mysql.createPool({
//     connectionLimit: 15,
//     host: 'localhost',
//     user: 'root',
//     password: 'mysql',
//     database: 'test'
// });
// (async()=>{
//     try {
//         const result=await search(pool,user,{state:1});
//         console.log(result);
//     } catch (error) {
//         console.log(error);
//     }
// })()


// search(pool, user)
//     .then(
//         res => {console.log(res);pool.end();},
//         err => console.log(err)
//     )
