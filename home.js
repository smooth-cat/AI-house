var { update, insert, del, search }=require('./mysqlOpr')
var {random}=require('./hanler')
var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: 15,
    host: 'localhost',
    user: 'root',
    password: 'mysql',
    database: 'test'
});
setInterval(async() => {
    user = {
        name: 1,
        temperature1: 40
    }
    var res=await search(pool,user,{state:1})
    for(var i=0; i<res.length; i++){
        res[i].temperature1=random(26,35)
        console.log(res[i],res[i].name);
        var res2=await update(pool,{temperature1:res[i].temperature1},{name:res[i].name})
    }

    
},1500);




