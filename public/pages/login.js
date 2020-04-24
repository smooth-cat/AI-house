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
//表单提交事件 id.form是<form>元素
id.mform.onsubmit=()=>{
    var name=id.name.value.replace(' ','')
    var password=id.password.value.replace(' ','')
    console.log(id.name.value);
    if(name.length==0||password.length==0){
        return false
    }
    return true;
}


//表单提交返回参数 id.ifram是<iframe>元素
id.ifram.onload = () => {
    console.log('iframe onload');
    var body=id.ifram.contentWindow.document.body
    var con = body.innerHTML
    body.innerHTML='';
    console.log(con);
    var {msg,mark}=JSON.parse(con)
    window.alert(msg);
    if(mark){
        window.location.href='./index.html?name='+id.name.value;
    }
}
