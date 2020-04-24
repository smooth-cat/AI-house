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

var date=new Date();
for(var i=0; i<1000000000; i++){
    
}
console.log(new Date()-date);



id.btn.innerHTML='成功'
// console.log(id);


