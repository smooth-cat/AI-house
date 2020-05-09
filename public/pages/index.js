var TIMEOUT=-1
var vm = new Vue({
   el: '#app',
   data() {
      return {
         slide_w:0,

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
         lights:[
            {s:false,id:'dinning_l',off_bg:'../imgs/ct.jpg',on_bg:'../imgs/ct_dark.jpg',name:'餐厅'},
            {s:false,id:'bath_l'   ,off_bg:'../imgs/ys.jpg',on_bg:'../imgs/ys_dark.jpg',name:'浴室'},
         ],
         lights2:[
            {s:0,id:'sitting_l',name:'客厅',bg:'../imgs/kt.jpg',},
            {s:0,id:'bedroom_l',name:'卧室',bg:'../imgs/ws.jpg',}
         ],
         slide_items:['About','Help','Setting','Join']
      }
   },
   async mounted() {
      var params = location.search; //获取参数
      var obj = {}
      if (params.length > 1) {
         params = params.substr(1)
         var arr = params.split('$')
         for (var i = 0; i < arr.length; i++) {
            var couple = arr[i].split('=')
            obj[couple[0]] = couple[1];
         }
      }
      this.name = obj.name||'JJLin'
      console.log('拿到名字', this.name);
      var success_ac = fetch(`http://aihouse.club/node/ac/get_instruct`, {//获取上一次退出时空调指令/灯光
         headers: new Headers({ 'Content-Type': 'application/json' }),
         body: JSON.stringify(obj),
         method: 'POST'
      })
      success_ac.catch(err => console.log(err))
      var res = await success_ac
      res = await res.json()
      var {dinning_l,bath_l,sitting_l,bedroom_l,disable,...air_con}=res
      this.lights[0].s=dinning_l
      this.lights[1].s=bath_l
      this.lights2[0].s=sitting_l
      this.lights2[1].s=bedroom_l
      Object.assign(this, air_con)//复制air_con的属性到this,重复则覆盖
      disable=!(!disable)//处理disabled属性不适应0/1的问题
      this.disable=disable
      console.log(this.mode)

      setInterval(async function () {//取温度/湿度
         var promise = fetch(`http://aihouse.club/node/temp_damp?name=${obj.name}`)
         promise.catch(err => console.log(err))
         var temp_damp = await promise
         temp_damp = await temp_damp.json()
         Object.assign(vm, temp_damp)
      }, 1000)
   },
   computed: {
      exceeds_limit() {//提示
         if (this.input_temp <= 30 && this.input_temp >= 15 || this.input_temp == '')
            return ''
         else
            return '设置的温度超出限制'
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
         var instruct = { name, aim_temp, mode, speed, damp_dispel, disable }

         var success = fetch(`http://aihouse.club/node/ac/set_instruct`, {
            headers: new Headers({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(instruct),
            method: 'POST'
         })
         success.catch(err => console.log(err))
         await success
         console.log('指令发送成功')
      },
      light_states(){//向服务器发送灯光控制指令
         var dinning_l=this.lights[0].s
         var bath_l=this.lights[1].s
         var sitting_l=this.lights2[0].s
         var bedroom_l=this.lights2[1].s
         var {name}=this
         var set_light={name,dinning_l,bath_l,sitting_l,bedroom_l}
         window.clearTimeout(TIMEOUT)
         TIMEOUT=window.setTimeout(async () => {//防止滑动多次发送请求
            var success = fetch(`http://aihouse.club/node/set_light`, {
               headers: new Headers({ 'Content-Type': 'application/json' }),
               body: JSON.stringify(set_light),
               method: 'POST'
            })
            success.catch(err=>console.log(err))
            var res=await success
            res=await res.text()
            console.log(res)
         }, 300)
      },
      // ai_mode(){
      //    if(this.mode=='智能模式'){
      //       this.aim_temp=26
      //       this.damp_dispel='除湿已开启'
      //       this.speed=2
      //       Object.defineProperties(vm,{
      //          'aim_temp':{writable:false},
      //          'damp_dispel':{writable:false},
      //          'speed':{writable:false}
      //       })
      //    }else{
      //       Object.defineProperties(vm,{
      //          'aim_temp':{writable:true},
      //          'damp_dispel':{writable:true},
      //          'speed':{writable:true}
      //       })
      //    }
      // }
   },
  
   methods: {
      show_slide(){
         if(this.slide_w==0)
            this.slide_w=200
         else
            this.slide_w=0
      },
      set_temp() {
         if (this.exceeds_limit != '' || this.input_temp == '') {
            window.alert('输入温度不恰当！')
            return
         }
         this.aim_temp = this.input_temp
      },
      switch_air() {
         this.is_air = true
      },
      switch_light() {
         this.is_air = false
      },
      on_off() {
         this.disable = !this.disable
      },
      dispel() {
         if (this.damp_dispel == '')
            this.damp_dispel = '除湿已开启'
         else
            this.damp_dispel = ''
      }
   }
})
window.onunload = () => {//离开页面时关闭服务器的温度变化检测
   console.log('页面没了');
   fetch(`http://aihouse.club/node/shutdown?name=${vm.name}`, {
      keepalive: true
   })
      .then(res => res.text())
      .then(res => console.log(res))
      .catch(err => console.log(err))
}