# AI-house
      大家一起来维护这个项目把
      这是一个网页版的智能家居项目
## 如何启动这个项目

### 1.下载此项目
   下载此项目后，**解压至F:/Back**,
   将文件夹名由 AI-house-master 改为 node-express，
   **找到node-express/public/pages文件夹中的 index.js 和 login.js**
   **分别打开，通过Ctrl+H 将所有 aihouse.club 替换为 127.0.0.1**

### 2.安装、配置 nginx
1. 下载nginx: http://nginx.org/en/download.html
   注意下载**和自己电脑系统对应**的nginx 下载后**解压至F:/Back**
   <img width="550px" src="https://github.com/smooth-cat/AI-house/blob/master/public/imgs/nginx.png">
2. 配置: 解压后打开文件夹中的**conf目录**下的nginx.conf文件
   找到
```
        location / {
            root   html;
            index  index.html index.htm;
        }
```
   将其替换为以下代码即可
```
        #静态资源 路径匹配
        location ~^/imgs {# 请求路径以/imgs开头的
            #根
            root F:/Back/node-express/public; 
        }
        location / { # 请求路径包含“/”的
            root   F:/Back/node-express/public/pages;
            index  /login.html; #凡是以/结尾的请求都会访问
        }
        #动态请求
        location ~^(/node) {# 请求路径以node开头的
            proxy_pass http://127.0.0.1:9000;
        }
```
3.启动：在nginx.**exe**的目录下启动cmd 输入:start nginx.exe

      重启：nginx -s reload
      停止：nginx -s stop
#### 至此在浏览器输入127.0.0.1就可以看到登录界面了，***如果失败提示404请重启电脑再试***
  
### 3.安装MySQL
1. 下载mysql：https://dev.mysql.com/get/Downloads/MySQLInstaller/mysql-installer-community-5.7.30.0.msi
2. 安装数据库时用户名请填root  密码填mysql  
   **如果安装时不用这个账号密码**，就把app.js 和 home.js 中的 mysql.createPool() 函数做对应修改 
3. 安装教程请**务必**参考：https://www.bilibili.com/video/BV1GW411g7pF?from=search&seid=16379453420756899056  
   如果有教程之外的选项点确定就行了
4. 使用MySQL,

   登录：打开powershell(win+R 输入powershell)，输入以下内容,**注意-p和密码是贴在一起的**
```
      mysql -u 用户名 -p密码;  
```      
  接着需要创建 数据库和表，**代码必须和以下一模一样**，不然node程序无法操作数据库  
  创建 数据库和创建表：
```
      //创建一个名为test的数据库
      create database test;
      
      //选择test数据库进行操作
      use test;
      
      //创建webuser,ac,lights三个表
      create table webuser(
           id int primary key auto_increment,
           name varchar(20) unique,
           password varchar(20),
           state bool default 1,
           avater varchar(20),
           temperature float default 26,
           damp float default 50
      );
      create table ac(
           name varchar(20) primary key,
           aim_temp int,
           mode varchar(20),
           speed int,
           damp_dispel varchar(20),
           disable bool
      );
      create table lights(
           name varchar(20) primary key,
           dinning_l bool,
           bath_l bool,
           sitting_l int,
           bedroom_l int
      );
```
#### 至此数据库的表就准备完毕了

### 4.安装node，启动 app.js 和 home.js
   这一步就so easy了，下载长期支持版node：https://nodejs.org/zh-cn/   
   下载完后，在node-express目录下启动两个cmd   
   如果有vscode 可以打开该文件夹，按 ctrl+~ 打开终端，ctrl+shift+5 分裂出两个终端 ，其他的编辑器我没用过不知道~  
   运行： 一个 cmd或终端 输入 **node app**  另一个输入 **node home**  
   停止运行: ctrl+c 不行就多按几下  
### node服务器就启动完毕了 大功告成~ 在浏览器 127.0.0.1 就可以进行业务操作了~
### 提示：可以进行业务操作的条件就3个：nginx启动，app.js和home.js启动，数据库表已经建好(数据库可以不用登录只要表建好就行了)
#### 如果node出现 "Client does not support authentication protocol requested by server;"异常 请登录mysql输入以下代码,
```
use mysql;
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
flush privileges;
```
#### 具体原因是：mysql版本太高，但是我这里给的mysql下载链接是低版本的应该问题不大
