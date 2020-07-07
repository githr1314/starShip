# Phaser小游戏-星战Demo

## 访问地址

> [星战Demo](https://test.digitalin.com.cn/game/starShip/index.html)  

>[原版Demo](http://game.webxinxin.com/starship/)
原作者：jschomay

## 玩法
+ 手机打开：手指滑动即可;
+ 电脑打开：上，下 ，左 ，右控制方向，空格射击;

## 文件结构

> starShip
> > assets 
存放资源文件，图片，字体  

> > game.js
游戏初始化，渲染，运行逻辑的js文件，已经注释了99%代码，基本能看懂  

> > index.html
访问的html页面  

> > phaser.min.js
Phaser游戏引擎js文件  

> > README.md
游戏必读文件

## 使用方法

+ 下载starShip文件；
+ 双击starShip/index.html 即可打开运行；
+ 如果要在chrome打开，可能会有跨域报错，可以把starShip放到Apache Tomcat的webapps下，然后启动tomcat，通过8080端口访问；

## API（英文）

[Phaser API](https://www.phaser-china.com/docs/Index.html)
> ps：看不懂就用chrome打开吧，自动翻译；

## 更新日志

> 2019-04-18
+ 增加了上下移动的功能，以及边界检测
+ 游戏界面适配设备全屏
+ 调整了游戏内玩家飞船开局位置
+ 增加了各种飞船的模型大小



