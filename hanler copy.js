module.exports = { logReg ,getTemperature,shutdown};
var { update, insert, del, search } = require('./mysqlOpr');
function random(min, max) {
    return Math.random(max - min) * 10 + min;
}
var userTemp={}//用户-温度 键值对
function getTemperature(user){//获取温度处理
    var a=userTemp[user.name].temps[0]
    console.log(a);
    return a;       
}

function shutdown(user){
    console.log('进入shutdow');
    clearInterval(userTemp[user.name].time);
    return 'ok';
}

async function logReg(pool, msg) {//登录-注册处理
    try {
        var { way, ...user } = msg;
        if (way == 'login') {
            var search_val = await search(pool, user);
            if(search_val.length==0)
                return {msg:'用户名不存在',mark:false}
            else if(search_val[0].password!=user.password)
                return {msg:'密码错误',mark:false}
            else{//告知home向数据库传入数据
                var timer=setInterval(() => {
                    userTemp[user.name].temps=[random(26,35),random(26,35),random(26,35),random(26,35)]   
                    userTemp[user.name].damps=[random(45,55),random(45,55),random(45,55),random(45,55)]
                    // console.log(userTemp[user.name]);
                }, 1500);
                userTemp[user.name]={};
                userTemp[user.name].time=timer;
                return {msg:'登录成功',mark:true}
            }
        }
        else {
            var insert_val = await insert(pool, user);
            return insert_val
        }
    } catch (error) {
        console.log('数据操作出错');
        console.log(error);
    }

}