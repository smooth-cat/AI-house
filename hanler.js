module.exports = { logReg ,getTemperature,shutdown,random};
var { update, insert, del, search } = require('./mysqlOpr');
function random(min, max) {
    return Math.random(max - min) * 10 + min;
}
var userTemp={}//用户-温度 键值对
async function getTemperature(pool,user){//获取温度处理
    var res=await search(pool,user,{name:user.name})
    console.log('拿到温度',res);
    var {temperature1}=res[0]
    return temperature1;       
}

async function shutdown(pool,user){
    console.log('进入shutdow');
    user.state=0;
    var res= await update(pool,user,{name:user.name})
    return 'ok';
}

async function logReg(pool, msg) {//登录-注册处理
    try {
        var { way, ...user } = msg;
        if (way == 'login') {
            var search_val = await search(pool, user,{name:user.name});
            if(search_val.length==0)
                return {msg:'用户名不存在',mark:false}
            else if(search_val[0].password!=user.password)
                return {msg:'密码错误',mark:false}
            else{//将user.state置1
                user.state=1;
                await update(pool,user,{name:user.name})
                await update(pool,user,{name:user.name})
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