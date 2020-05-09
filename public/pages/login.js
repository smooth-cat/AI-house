function getIdGroup(){
    var elements= window.document.all
    var id=''
    var doc={}
    for(var i=0; i<elements.length; i++){
        id=elements[i].id
        if(id!='')
              //键     值
            doc[id]=elements[i]
    }
    return doc;
}
id=getIdGroup();
console.log(document.all)
function setLayout(){
    var {height}=getComputedStyle(id.mform,null)
    height=height.substring(0,height.length-2)
    id.mform.style.cssText=`margin-top: -${height/2}px;`
}
function changeMode(){
    if(id.btn.value=='login'){
        id.btn.value='register'
        id.btn.innerHTML='Register'
        id.big_title.innerHTML='Register an Account'
        id.confirm_con.style.cssText=`display: inline-block`
        id.change_btn.innerHTML='to login'
        id.name.value=''
        id.password.value=''
        id.confirm.value=''
    }else{
        id.btn.value='login'
        id.btn.innerHTML='Login'
        id.big_title.innerHTML='Sign in to Smart Home'
        id.confirm_con.style.cssText=`display: none`
        id.change_btn.innerHTML='to register'
        id.name.value=''
        id.password.value=''
        id.confirm.value=''
    }
}


async function onClick(){
    console.log('进来了')
    var user={
        name:id.name.value,
        password:id.password.value,
    }
    if(user.name.length<4||user.password.length<4){
        window.alert('用户名或密码不能小于4位！')
        return;
    }
    if(id.btn.value=='register'&&user.password!=id.confirm.value){
        window.alert('两次密码输入不相同！')
        return;
    }

    var success=fetch(`http://aihouse.club/node/user/${id.btn.value}`,{
        headers:new Headers({'Content-Type':'application/json'}) ,
        body:JSON.stringify(user),
        method:'POST'
    })
    success.catch(err=>{console.log(err)})
    var res=await success;
    res=await res.json();
    var {msg,mark}=res;
    window.alert(msg);
    if(mark){
        window.location.href='./index.html?name='+id.name.value;
    }
}
// console.log(id);


