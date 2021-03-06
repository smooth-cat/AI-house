var TIMEOUT = -1
var vm = new Vue({
   el: '#app',
   /*-------------------- 数据绑定 ----------------------*/
   data() {
      return {
         slide_w: 0,
         
         is_air: true,     //选项卡（空调/灯光）   

         name: '',          //用户名
         aim_temp: 26,     //目标温度 
         mode: '制冷',      //模式 
         speed: 1,         //风速
         damp_dispel: '',  //除湿模式
         disable: false,   //开关

         temperature: 26,  //实时温度
         damp: 55,         //实时湿度
         input_temp: '',
         modes: [
            { picked_id: 1, mode_name: '制冷' },
            { picked_id: 2, mode_name: '供暖' },
            { picked_id: 3, mode_name: '送风' },
            { picked_id: 4, mode_name: '智能模式' },
         ],
         lights: [
            { s: false, id: 'dinning_l', off_bg: '../imgs/ct.jpg', on_bg: '../imgs/ct_dark.jpg', name: '餐厅' },
            { s: false, id: 'bath_l', off_bg: '../imgs/ys.jpg', on_bg: '../imgs/ys_dark.jpg', name: '浴室' },
         ],
         lights2: [
            { s: 0, id: 'sitting_l', name: '客厅', bg: '../imgs/kt.jpg', },
            { s: 0, id: 'bedroom_l', name: '卧室', bg: '../imgs/ws.jpg', }
         ],
         slide_items: ['About', 'Help', 'Setting', 'Join'],
      }
   },
   /*---------------- 页面生成时触发 -----------------*/
   async mounted() {
      var params = location.search; //获取跳转参数
      var obj = {}
      if (params.length > 1) {
         params = params.substr(1)
         var arr = params.split('&')
         for (var i = 0; i < arr.length; i++) {
            var couple = arr[i].split('=')
            obj[couple[0]] = couple[1];
         }
      }
      this.name = obj.name || 'JJLin'
      console.log('拿到名字', this.name);
      //获取空调/灯的设置
      var success_ac = fetch(`http://aihouse.club/node/get_ac_lights?name=${this.name}`)
      success_ac.catch(err => console.log(err))
      var res = await success_ac
      res = await res.json()

      var { dinning_l, bath_l, sitting_l, bedroom_l, disable, ...air_con } = res//改变灯光/空调设置
      this.lights[0].s = dinning_l
      this.lights[1].s = bath_l
      this.lights2[0].s = sitting_l
      this.lights2[1].s = bedroom_l
      console.log(air_con)
      Object.assign(this, air_con)//复制air_con的属性到this,重复则覆盖
      disable = !(!disable)//处理disabled属性不适应0/1的问题
      this.disable = disable
      console.log(this.mode)

      var cans = document.getElementsByTagName('canvas')//初始化坐标系
      cans = Array.from(cans)
      var j = []
      cans.forEach((v) => {
         j.push(v.getContext('2d'))
         init_axis(v.getContext('2d'))
      })

      setInterval(async function () {//取温度/湿度
         var promise = fetch(`http://aihouse.club/node/temp_damp?name=${obj.name}`)
         promise.catch(err => console.log(err))
         var temp_damp = await promise
         temp_damp = await temp_damp.json()
         var { temperature, damp } = temp_damp

         var next1=draw(temperature,5,j[0],times1,x1)//绘制折线
         times1=next1.times;x1=next1.x
         var next2=draw(damp,2,j[1],times2,x2)
         times2=next2.times;x2=next2.x

         Object.assign(vm, { temperature, damp })//改变ui
      }, 1000)



   },
   /*------------------ 响应值变化方法 ------------------*/
   computed: {
      exceeds_limit() {//温度输入提示
         if ((this.input_temp <= 30 && this.input_temp >= 15) || this.input_temp == '')
            return ''
         return '  输入温度超出限度'
      },
      smart_tip(){//智能模式提示
         if(this.mode=='智能模式'&&this.exceeds_limit=='')
            return '智能模式将维持 温度26℃ 湿度50%'
         return ''
      },
      tips_color(){
         if ((this.input_temp > 30 || this.input_temp < 15)&&this.input_temp!='')
            return 'rgba(233, 61, 61, 0.972)'
         if(this.mode=='智能模式')
            return 'rgba(88,246,170,0.777)'
         return 'white' 
      },
      wind() {//显示风速
         // console.log(this.speed)
         switch (this.speed * 1) {
            case 1: return '低风速'; break
            case 2: return '中风速'; break
            case 3: return '高风速'; break
            default: break
         }
      },
      sw_state() {//空调开关屏显
         if (this.disable)
            return 'OFF'
         else
            return 'ON '
      },
      async air_states() {//向服务端发送空调命令
         var { name, aim_temp, mode, speed, damp_dispel, disable } = this

         var success = fetch(`http://aihouse.club/node/set_ac`, {
            headers: new Headers({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ name, aim_temp, mode, speed, damp_dispel, disable }),
            method: 'POST'
         })
         success.catch(err => console.log(err))
         await success
         console.log('空调指令发送成功')
      },
      light_states() {//向服务器发送灯光控制指令
         var dinning_l = this.lights[0].s
         var bath_l = this.lights[1].s
         var sitting_l = this.lights2[0].s
         var bedroom_l = this.lights2[1].s
         var { name } = this

         window.clearTimeout(TIMEOUT)
         TIMEOUT = window.setTimeout(async () => {//防止滑动多次发送请求
            var success = fetch(`http://aihouse.club/node/set_lights`, {
               headers: new Headers({ 'Content-Type': 'application/json' }),
               body: JSON.stringify({ name, dinning_l, bath_l, sitting_l, bedroom_l }),
               method: 'POST'
            })
            success.catch(err => console.log(err))
            await success
            console.log('灯光指令发送成功')
         }, 300)
      },
   },
   /*------------------ 点击方法 ------------------*/
   methods: {
      show_slide() {//展示侧边栏
         if (this.slide_w == 0)
            this.slide_w = 200
         else
            this.slide_w = 0
      },
      set_temp() {//确认温度按钮触发
         if (this.exceeds_limit != '' || this.input_temp == '') {
            window.alert('输入温度不恰当！')
            return
         }
         this.aim_temp = this.input_temp
      },
      switch_air() {//选项卡切换至空调
         this.is_air = true
      },
      switch_light() {//选项卡切换至灯光
         this.is_air = false
      },
      on_off() {//空调开关
         this.disable = !this.disable
      },
      dispel() {//除湿开关
         if (this.damp_dispel == '')
            this.damp_dispel = '除湿已开启'
         else
            this.damp_dispel = ''
      }
   }
})

/*-------- 绘制温度/湿度折线的 变量/函数 --------*/
function init_axis(j) {//canva初始化坐标轴
   j.strokeStyle = '#ffffff'
   j.lineWidth = 1.5
   j.beginPath()
   j.moveTo(50, 280)
   j.lineTo(50, 50)
   j.lineTo(45, 60)
   j.lineTo(50, 50)
   j.lineTo(55, 60)

   j.moveTo(20, 250)
   j.lineTo(400, 250)
   j.lineTo(390, 245)
   j.moveTo(400, 250)
   j.lineTo(390, 255)
   j.stroke()
   j.translate(50, 250)
   //画笔特性
   j.font = "bold italic 15px arial"
   j.fillStyle = '#ffffff'

}


var times1 = 0
var times2 = 0
var x1 = 20
var x2 = 20
function draw (rd, multiple, j,times,x) {//绘制折线
   const o = 2 * Math.PI
   rd *= multiple
   if (times == 0) {
      j.clearRect(10, -8, 400, -330)
      j.beginPath()
   }
   if (times >= 1 && times <= 4) {//第0次 画圆 画笔放在圆心
      j.lineTo(x, -rd)
      j.stroke()
   }
   j.moveTo(x, -rd)
   j.arc(x, -rd, 3, 0, o)
   j.fill()
   j.moveTo(x, -rd)
   j.fillText((rd / multiple).toFixed(2), x-8, -rd - 10)
   j.moveTo(x, -rd)
   times = (times + 1) % 5
   x = (x + 80) % 400
   return {times,x}
}



/*--------------- 离开页面 ---------------*/

window.onunload = () => {
   console.log('页面没了');
   fetch(`http://aihouse.club/node/shutdown?name=${vm.name}`, {
      keepalive: true
   })
      .then(res => res.text())
      .then(res => console.log(res))
      .catch(err => console.log(err))
}