var params = location.search; //获取参数
var obj ={}
if(params.length>1){
    params=params.substr(1)
    var arr=params.split('$')
    for(var i=0; i<arr.length; i++){
        var couple= arr[i].split('=')
        obj[couple[0]]=couple[1];
    }
}
console.log(obj);
var {name}=obj;
function $(id){
    return document.getElementById(id)//类似安卓的findViewById()
}
function getTmperature(temp){
    fetch(`http://aihouse.club/node/temperature?name=${name}&temperature1=0`,{

    })
    .then(res=>res.text())
    .then(res=>temp.innerHTML=`${res}`)//innerHTML相当于setText()
    .catch(err=>console.log(err))
}

const temp=$('temp')
getTmperature(temp)

setInterval(() => { //每隔一段时间执行一次
    getTmperature(temp)
}, 2000);

window.onunload =()=>{//离开页面时关闭服务器的温度变化检测
    console.log('页面没了');
    
    fetch(`http://aihouse.club/node/shutdown?name=${name}`,{
        keepalive:true
    })
    .then(res=>res.text())
    .then(res=>console.log(res))
    .catch(err=>console.log(err))
}