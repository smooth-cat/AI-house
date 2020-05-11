module.exports = {set_lights, login, register, getTempDamp, shutdown, random,get_instruct ,set_instruct};
var { update, insert, del, search } = require('./mysqlOpr');
function random(min, max) {
   return Math.random()*(max - min) + min;
}

async function login(pool, user) {//登录处理
   var search_val = await search('webuser', pool, user, { name: user.name })
   if (search_val.length == 0)
      return { msg: '用户名不存在', mark: false }
   else if (search_val[0].password != user.password)
      return { msg: '密码错误', mark: false }
   else {//将user.state置1
      user.state = 1;
      console.log(user)//只有name password 和  state 
      await update('webuser', pool, user, { name: user.name })
      return { msg: '登录成功', mark: true }
   }
}

async function register(pool, user) {//注册处理
   try {
      console.log(user)//只有name 和 password
      var { name } = user
      var ac={
         name,
         aim_temp:26,
         mode:'智能模式',
         speed:2,
         damp_dispel:'除湿已开启',
         disable:true
      }
      var lights={
         name,
         dinning_l:false,
         bath_l:false,
         sitting_l:0,
         bedroom_l:0
      }
      user.temperature=random(10,35)
      user.damp=random(30,80)
      var success_user =  insert('webuser', pool, user)
      var success_ac =  insert('ac', pool, ac)
      var success_lights =  insert('lights', pool, lights)
      await success_user
      await success_ac
      await success_lights
      return { msg: '注册成功', mark: true }
   } catch (err) {
      console.log(err)
      return { msg: '用户名已被注册！', mark: false }
   }

}

async function shutdown(pool, user) {//退出处理
   console.log('进入shutdow');
   user.state = 0;
   await update('webuser', pool, user, { name: user.name })
   return 'ok';
}

async function getTempDamp(pool, name) {//获取温度/湿度
   var res = await search('webuser', pool, {temperature:0,damp:0}, { name })
   // console.log('拿到温度湿度', res,'名字',name)
   return res[0]
}

async function get_instruct(pool,name){//获取数据库中空调指令/和灯 
   var ac={aim_temp:0,mode:'',speed:0,damp_dispel:'',disable:false}
   var lights={dinning_l:0,bath_l:0,sitting_l:0,bedroom_l:0}
   var promise= search('ac',pool,ac,{name})
   var promise1= search('lights',pool,lights,{name})
   var promise2=update('webuser',pool,{state:1},{name})
   promise.catch(err=>console.log(err))
   promise1.catch(err=>console.log(err))
   promise2.catch(err=>console.log(err))
   res2=await promise2
   res1=await promise1
   res=await promise
   Object.assign(res[0],res1[0])
   console.log('发送初始设置:',res[0])
   return res[0]
}

async function set_instruct(pool,ac){//设置空调状态
   var {name,...instruct}=ac
   var promise=update('ac',pool,instruct,{name})
   promise.catch(err=>console.log(err))
   await promise
   return ''
}

async function set_lights(pool,lights){//设置灯状态
   var {name,...instruct}=lights
   var promise=update('lights',pool,instruct,{name})
   promise.catch(err=>console.log(err))
   await promise
   return ''
}