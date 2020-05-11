var { update, insert, del, search, getConnect } = require('./mysqlOpr')
var { random } = require('./hanler')
var mysql = require('mysql');
var pool = mysql.createPool({
   connectionLimit: 30,
   host: 'localhost',
   user: 'root',
   password: 'mysql',
   database: 'test'
});
console.log('温度模拟已开启')
setInterval(async () => {
   user = {
      name: '',
      temperature: 40
   }
   getConnect(pool).then(con => {
      con.query(`select * from webuser,ac where webuser.name=ac.name 
         and state=1`, async (err, res) => {
         if (err)
            console.log(err)
         else {
            for (var i = 0; i < res.length; i++) {

               //分析每一个res 的 diable 
               // mode -> {制冷 供暖 送风 智能模式 }
               //制冷：
               //temp高于aim->给一个降温变量  temp低于aim->无动作
               //供暖：
               //temp低于aim->给一个升温变量  temp高于aim->无动作
               //送风：
               //无动作
               //智能模式：
               //目标温度26 目标湿度50%
               var { name, aim_temp, mode, speed, damp_dispel, disable, temperature, damp } = res[i]
               var val=1
               switch(speed){
                  case 1:val=0.65;break;
                  case 2:val=1;break;
                  case 3:val=1.3;break;
                  default:break;
               }
               if(temperature>=7&&temperature<=35){
                  temperature+=random(-0.65,+0.65)
               }else if(temperature>35){
                  temperature-=0.65
               }else{
                  temperature+=0.65
               }

               if(damp>=30&&damp<=70){
                  damp+=random(-0.65,+0.65)
               }else if(damp>70){
                  damp-=0.65
               }else{
                  damp+=0.65
               }
               if (!disable) {
                  switch (mode) {
                     case '制冷':
                        if (temperature > aim_temp) {
                           temperature -= val
                        }
                        break;

                     case '供暖':
                        if (temperature < aim_temp)
                           temperature += val
                        break;

                     case '送风':


                        break;

                     case '智能模式':
                        if (temperature > 26)
                           temperature -= 1
                        else if (temperature < 26)
                           temperature += 1
                        break;
                     default: break;
                  }
                  if(damp_dispel=='除湿已开启'||mode=='智能模式'){
                     if(damp>50)
                        damp--
                     if(damp<50)
                        damp++
                  }
               }

               // res[i].temperature=temperature
               // res[i].damp=damp
                  console.log(res[i]);
               var res2 = await update('webuser', pool, { temperature,damp }, { name: res[i].name })
            }
         }
         con.release()
      })
   })



}, 500);




