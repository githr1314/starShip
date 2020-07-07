// 创建游戏对象，游戏画布100%宽，100%高，渲染引擎Canvas, 游戏初始场景，一个包含Phaser.State函数(preload, create, update, render)的对象
var game = new Phaser.Game('100','100', Phaser.CANVAS, 'demo', {preload: preload, create: create, update: update, render: render});
// 定义玩家
var player;
// 定义绿色敌人
var greenEnemies;
// 定义蓝色敌人
var blueEnemies;
// 定义-子弹
var enemyBullets;
// 定义星空
var starfield;
// 按键对象
var cursors;
// 未知
var bank;
// 飞船发射器
var shipTrail;
// 未知
var explosions;
// 玩家死亡对象
var playerDeath;
// 导弹
var bullets;
// 开火按钮
var fireButton;
// 导弹定时器
var bulletTimer = 0;
// 飞船护盾
var shields;
// 得分
var score = 0;
// 得分文档
var scoreText;
// 绿色敌人加载定时器
var greenEnemyLaunchTimer;
// 绿色敌人随机时间间隔
var greenEnemySpacing = 1000;
// 蓝色敌人加载定时器
var blueEnemyLaunchTimer;
// 蓝色敌人加载状态-未加载
var blueEnemyLaunched = false;
// 蓝色敌人随机事件间隔
var blueEnemySpacing = 2500;
// boss加载定时器
var bossLaunchTimer;
// boos加载状态-未加载
var bossLaunched = false;
// boss随机时间间隔
var bossSpacing = 20000;
// boss导弹定时器
var bossBulletTimer = 0;
// boss垂直方向-向上
var bossYdirection = -1;
// 游戏结束
var gameOver;

var ACCLERATION = 800;
// 拖动的速度
var DRAG = 400;
// 最高速度
var MAXSPEED = 400;

// 游戏预加载方法
function preload() {
    // 加载图片 starfield.png
    game.load.image('starfield', 'assets/starfield.png');
    // 加载图片 player.png
    game.load.image('ship', 'assets/player.png');
    // 加载图片 bullet.png
    game.load.image('bullet', 'assets/bullet.png');
    // 加载图片 enemy-green.png
    game.load.image('enemy-green', 'assets/enemy-green.png');
    // 加载图片 enemy-blue.png
    game.load.image('enemy-blue', 'assets/enemy-blue.png');
    // 加载图片 enemy-blue-bullet.png
    game.load.image('blueEnemyBullet', 'assets/enemy-blue-bullet.png');
    // 加载精灵图 资源名称， 资源路径， 帧宽，帧高
    game.load.spritesheet('explosion', 'assets/explode.png', 128, 128);
    // 加载位图字体文件
    game.load.bitmapFont('spacefont', 'assets/spacefont/spacefont.png', 'assets/spacefont/spacefont.xml');  
    // 加载图片 boss.png
    game.load.image('boss', 'assets/boss.png');
    // 加载图片 death-ray.png
    game.load.image('deathRay', 'assets/death-ray.png');
}

// 游戏创建方法
function create() {
    //  创建一个背景图
    starfield = game.add.tileSprite(0, 0, window.innerWidth, window.innerHeight, 'starfield');

    // 增加游戏对象组
    bullets = game.add.group();
    // 增加物理系统
    bullets.enableBody = true;
    // 物理主体类型
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    // 创建导弹组群的数量 创建多个Phaser.Sprite对象，并将它们添加到此组的顶部。
    bullets.createMultiple(30, 'bullet');
    // 在该组的所有子项中快速设置相同的属性为新值
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 1);
    bullets.setAll('scale.x', 1.5);
    bullets.setAll('scale.y', 1.5);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    // 玩家增加精灵
    player = game.add.sprite(500, game.height-100, 'ship');
    // 玩家生命值
    player.health = 100;
    // 锚点（纹理的位置）设置居中,影响到飞船的导弹初始位置
    player.anchor.setTo(0.5, 0.5);
    // 物理类型
    game.physics.enable(player, Phaser.Physics.ARCADE);
    player.scale.x = 3;
    player.scale.y = 2;
    // 玩家可以达到的最大速度
    player.body.maxVelocity.setTo(MAXSPEED, MAXSPEED);
    // 拖动应用于身体的运动速度
    player.body.drag.setTo(DRAG, DRAG);
    // 武器等级（暂未知）
    player.weaponLevel = 1
    // 当游戏对象被杀死时，将被调度
    player.events.onKilled.add(function(){
        shipTrail.kill();
    });
    //当游戏对象从先前被杀死的状态恢复时，调度该信号
    player.events.onRevived.add(function(){
        shipTrail.start(false, 5000, 10);
    });

    // 绿色敌人
    greenEnemies = game.add.group();
    // 绿色的人赋予物理特性
    greenEnemies.enableBody = true;
    // 赋予物理类型
    greenEnemies.physicsBodyType = Phaser.Physics.ARCADE;
    // 创造多个绿色敌人
    greenEnemies.createMultiple(5, 'enemy-green');
    // 在该组的所有子项中快速设置相同的属性为新值
    greenEnemies.setAll('anchor.x', 0.5);
    greenEnemies.setAll('anchor.y', 0.5);
    greenEnemies.setAll('scale.x', 1);
    greenEnemies.setAll('scale.y', 1);
    greenEnemies.setAll('angle', 180);
    // 循环绿色敌人数组
    greenEnemies.forEach(function(enemy){
        addEnemyEmitterTrail(enemy);
        // 碰撞体积
        enemy.body.setSize(enemy.width* 3 / 4, enemy.height * 3 / 4);
        // 敌人伤害数值20
        enemy.damageAmount = 20;
        // 调用被杀死的方法
        enemy.events.onKilled.add(function(){
            enemy.trail.kill();
        });
    });

    //  1000毫秒后，调用计时器事件的回调
    game.time.events.add(1000, launchGreenEnemy);

    //  Blue enemy's bullets 蓝色敌人的导弹群
    blueEnemyBullets = game.add.group();
    // 蓝色敌人的导弹赋予物理属性
    blueEnemyBullets.enableBody = true;
    // 赋予蓝色敌人子弹物理类型
    blueEnemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    // 蓝色敌人导弹创建数量
    blueEnemyBullets.createMultiple(30, 'blueEnemyBullet');
    // callAll （method，context，args）在所有孩子身上调用由名称指定的函数
    blueEnemyBullets.callAll('crop', null, {x: 90, y: 0, width: 90, height: 70});
    // 在该组的所有子项中快速设置相同的属性为新值
    blueEnemyBullets.setAll('alpha', 0.9);
    blueEnemyBullets.setAll('anchor.x', 0.5);
    blueEnemyBullets.setAll('anchor.y', 0.5);
    blueEnemyBullets.setAll('scale.x', 1.5);
    blueEnemyBullets.setAll('scale.y', 1.5);
    blueEnemyBullets.setAll('outOfBoundsKill', true);
    blueEnemyBullets.setAll('checkWorldBounds', true);
    blueEnemyBullets.forEach(function(enemy){
        enemy.body.setSize(enemy.width* 3 / 4, enemy.height * 3 / 4);
    });

    // 同上
    blueEnemies = game.add.group();
    blueEnemies.enableBody = true;
    blueEnemies.physicsBodyType = Phaser.Physics.ARCADE;
    blueEnemies.createMultiple(30, 'enemy-blue');
    blueEnemies.setAll('anchor.x', 0.5);
    blueEnemies.setAll('anchor.y', 0.5);
    blueEnemies.setAll('scale.x', 1.5);
    blueEnemies.setAll('scale.y', 1);
    blueEnemies.setAll('angle', 180);
    blueEnemies.forEach(function(enemy){
        enemy.damageAmount = 40;
    });

    // 设置boss，加载精灵图boss.png
    boss = game.add.sprite(0, 0, 'boss');
    // boss初始位置不存在
    boss.exists = false;
    // boss 初始状态为死亡
    boss.alive = false;
    // 设置boss的原点，默认值为0,0这意味着纹理的原点是左上角，设置比锚点0.5,0.5表示纹理原点居中，将锚点设置为1,1意味着纹理原点将位于右下角
    boss.anchor.setTo(0.5, 0.5);
    boss.damageAmount = 50;
    // 把boss顺时针旋转180度。
    boss.angle = 180;
    // 设置boss 水平方向缩放比例
    boss.scale.x = 1.5;
    // 设置boss 垂直方向缩放比例
    boss.scale.y = 1;
    // 设置boss物理属性类型
    game.physics.enable(boss, Phaser.Physics.ARCADE);
    // boss可以达到的最大速度，水平100，垂直80
    boss.body.maxVelocity.setTo(100, 100);
    // 未知属性，死亡=false
    boss.dying = false;
    // 定义方法finishOff
    boss.finishOff = function() {
        // 如果boss没有死亡
        if (!boss.dying) {
            // 设置boss的dying为true
            boss.dying = true;
            // bossDeath对象赋值
            bossDeath.x = boss.x;
            bossDeath.y = boss.y;
            bossDeath.start(false, 1000, 50, 20);
            // 游戏时间设置事件
            game.time.events.add(1000, function(){
                var explosion = explosions.getFirstExists(false);
                var beforeScaleX = explosions.scale.x;
                var beforeScaleY = explosions.scale.y;
                var beforeAlpha = explosions.alpha;
                explosion.reset(boss.body.x + boss.body.halfWidth, boss.body.y + boss.body.halfHeight);
                explosion.alpha = 0.4;
                explosion.scale.x = 3;
                explosion.scale.y = 3;
                var animation = explosion.play('explosion', 30, false, true);
                animation.onComplete.addOnce(function(){
                    explosion.scale.x = beforeScaleX;
                    explosion.scale.y = beforeScaleY;
                    explosion.alpha = beforeAlpha;
                });
                // 杀死boss对象
                boss.kill();
                // 杀死bosster对象
                booster.kill();
                // 设置boss属性dying为false
                boss.dying = false;
                // 设置bossDeath属性on为false
                bossDeath.on = false;
                //  queue next boss 定时器启动下一个boss
                bossLaunchTimer = game.time.events.add(game.rnd.integerInRange(bossSpacing, bossSpacing + 5000), launchBoss);
            });

            //  reset pacing for other enemies 重置其他敌人出现间隔时间
            blueEnemySpacing = 2500;
            greenEnemySpacing = 1000;

            //  give some bonus health
            player.health = Math.min(100, player.health + 40);
            // 护盾渲染
            shields.render();
        }
    };

    //  Boss death ray 增加boss的死亡射线
    function addRay(leftRight) {
        // 增加精灵死亡射线
        var ray = game.add.sprite(leftRight * boss.width * 0.75, 0, 'deathRay');
        // 设置射线存在false
        ray.alive = false;
        // 设置射线可见false
        ray.visible = false;
        // boss增加子对象-死亡射线
        boss.addChild(ray);
        // 死亡射线设置位置
        ray.crop({x: 0, y: 0, width: 40, height: 40});
        ray.anchor.x = 0.5;
        ray.anchor.y = 0.5;
        ray.scale.x = 2.5;
        // 伤害数值是boss的伤害数值
        ray.damageAmount = boss.damageAmount;
        // 给死亡射线增加物理属性
        game.physics.enable(ray, Phaser.Physics.ARCADE);
        // 设置死亡射线的宽，高
        ray.body.setSize(ray.width / 5, ray.height / 4);
        // 设置透明度更新
        ray.update = function() {
            this.alpha = game.rnd.realInRange(0.8, 1);
        };
        // 
        boss['ray' + (leftRight > 0 ? 'Right' : 'Left')] = ray;
    }
    // 右射线
    addRay(1);
    // 左射线
    addRay(-1);

    //  need to add the ship texture to the group so it renders over the rays
    // 增加boss的飞船材质
    var ship = game.add.sprite(0, 0, 'boss');
    // 设置锚点位于中间
    ship.anchor = {x: 0.5, y: 0.5};
    // boss对象增加子对象飞船，在死亡射线之上
    boss.addChild(ship);
    // boss 的开火逻辑函数
    boss.fire = function() {
        // 如果游戏当前时间大于boss的子弹定时器
        if (game.time.now > bossBulletTimer) {
            // 设置死亡射线间隔
            var raySpacing = 3000;
            // 死亡射线充能时间
            var chargeTime = 1500;
            // 死亡射线持续时间
            var rayTime = 1500;

            // 充能 & 射击
            function chargeAndShoot(side) {
                ray = boss['ray' + side];
                ray.name = side
                ray.revive();
                ray.y = 80;
                ray.alpha = 0;
                ray.scale.y = 13;
                game.add.tween(ray).to({alpha: 1}, chargeTime, Phaser.Easing.Linear.In, true).onComplete.add(function(ray){
                    ray.scale.y = 150;
                    game.add.tween(ray).to({y: -1500}, rayTime, Phaser.Easing.Linear.In, true).onComplete.add(function(ray){
                        ray.kill();
                    });
                });
            }
            // 左右充能并射击
            chargeAndShoot('Right');
            chargeAndShoot('Left');
            // boss定时器重置
            bossBulletTimer = game.time.now + raySpacing;
        }
    };

    // 控制boss行动逻辑
    boss.update = function() {
        // 如果boss不存在，直接返回
        if (!boss.alive) return;
        // boss左右射线更新
        boss.rayLeft.update();
        boss.rayRight.update();
        // 如果boss垂直位置大于140，就加速度-50
        if (boss.y > 300) {
            boss.body.acceleration.y = -50;
        }
        // 如果boss垂直位置小于140，加速度+50
        if (boss.y < 200) {
            boss.body.acceleration.y = 50;
        }
        // 如果boss水平位置大于 玩家水平位置加速度+50，boss水平位置加速度-50
        if (boss.x > player.x + 50) {
            boss.body.acceleration.x = -50;
        } else if (boss.x < player.x - 50) {
            boss.body.acceleration.x = 50;
        } else {
            boss.body.acceleration.x = 0;
        }

        //  Squish and rotate boss for illusion of "banking"
        // boss的水平速度/maxspeed的结果赋值给bank
        var bank = boss.body.velocity.x / MAXSPEED;
        // boss水平缩放
        boss.scale.x = 0.6 - Math.abs(bank) / 3;
        // 改变boss的角度 
        boss.angle = 180 - bank * 20;
        // booster是boss发射器
        booster.x = boss.x + -5 * bank;
        booster.y = boss.y + 10 * Math.abs(bank) - boss.height / 2;

        //  fire if player is in target
        // 当玩家在目标中时就开火
        var angleToPlayer = game.math.radToDeg(game.physics.arcade.angleBetween(boss, player)) - 90;
        var anglePointing = 180 - Math.abs(boss.angle);
        // 小于18°就开火
        if (anglePointing - angleToPlayer < 18) {
            boss.fire();
        }
    }

    //  boss's boosters
    // 定义boss的发射器bosster
    booster = game.add.emitter(boss.body.x, boss.body.y - boss.height / 2);
    // 发射器的宽度为0
    booster.width = 0;
    // 此函数生成一组新的粒子供此发射器使用。粒子在内部存储，等待通过Emitter.start发射。
    booster.makeParticles('blueEnemyBullet');
    // 循环该数组
    booster.forEach(function(p){
      p.crop({x: 120, y: 0, width: 45, height: 50});
      //  clever way of making 2 exhaust trails by shifing particles randomly left or right
      p.anchor.x = game.rnd.pick([1,-1]) * 0.95 + 0.5;
      p.anchor.y = 0.75;
    });
    // 设置发射器水平方向速度范围，最小值和最大值都为0。
    booster.setXSpeed(0, 0);
    // 设置发射器粒子的角速度，最小值和最大值都为0
    booster.setRotation(0,0);
    // 设置发射器垂直方向速度范围，最小值-30和最大值都为-50。
    booster.setYSpeed(-30, -50);
    // 设置重力值
    booster.gravity = 0;
    // 设置粒子的alpha
    booster.setAlpha(1, 0.1, 400);
    // 设置粒子比例的变化
    booster.setScale(0.3, 0, 0.7, 0, 5000, Phaser.Easing.Quadratic.Out);
    // 将boss或者bosster置于组的顶部，不懂
    boss.bringToTop();

    //  And some controls to play the game with
    // 创建并返回一个包含4个热键的对象，分别为Up，Down，Left和Right。
    cursors = game.input.keyboard.createCursorKeys();
    // 开火按钮 = 空格键
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    //  Add an emitter for the ship's trail
    // 给玩家增加一个发射器
    shipTrail = game.add.emitter(player.x, player.y + 10, 400);
    // 发射器宽度10
    shipTrail.width = 10;
    // 发射器的粒子使用 bullet.png材质
    shipTrail.makeParticles('bullet');
    //同上booster
    shipTrail.setXSpeed(30, -30);
    shipTrail.setYSpeed(200, 180);
    shipTrail.setRotation(50,-50);
    shipTrail.setAlpha(1, 0.01, 800);
    shipTrail.setScale(0.05, 0.6, 0.05, 0.6, 2000, Phaser.Easing.Quintic.Out);
    shipTrail.start(false, 5000, 10);

    //  An explosion pool
    // 增加一个组对象，爆炸效果
    explosions = game.add.group();
    explosions.enableBody = true;
    explosions.physicsBodyType = Phaser.Physics.ARCADE;
    // 创建30个爆炸对象，并将它们添加到此组的顶部。
    explosions.createMultiple(30, 'explosion');
    explosions.setAll('anchor.x', 0.5);
    explosions.setAll('anchor.y', 0.5);
    explosions.forEach( function(explosion) {
        // 添加动画
        explosion.animations.add('explosion');
    });

    //  Big explosion
    // 玩家死亡对象增加发射器
    playerDeath = game.add.emitter(player.x, player.y);
    // 死亡范围宽50
    playerDeath.width = 50;
    // 死亡范围高50
    playerDeath.height = 50;
    // 死亡生成一组粒子，同上
    playerDeath.makeParticles('explosion', [0,1,2,3,4,5,6,7], 10);
    playerDeath.setAlpha(0.9, 0, 800);
    playerDeath.setScale(0.1, 0.6, 0.1, 0.6, 1000, Phaser.Easing.Quintic.Out);

    //  Big explosion for boss
    // boss死亡对象增加一个发射器
    bossDeath = game.add.emitter(boss.x, boss.y);
    // boss死亡宽度
    bossDeath.width = boss.width / 2;
    // boss 死亡高度
    bossDeath.height = boss.height / 2;
    // boss死亡生成一组粒子
    bossDeath.makeParticles('explosion', [0,1,2,3,4,5,6,7], 20);
    bossDeath.setAlpha(0.9, 0, 900);
    bossDeath.setScale(0.3, 1.0, 0.3, 1.0, 1000, Phaser.Easing.Quintic.Out);

    //  Shields stat
    // 右上角护盾显示渲染
    shields = game.add.bitmapText(game.world.width - 250, 10, 'spacefont', '' + player.health +'%', 50);
    shields.render = function () {
        shields.text = 'Shields: ' + Math.max(player.health, 0) +'%';
    };
    shields.render();

    //  Score
    // 左上角得分显示渲染
    scoreText = game.add.bitmapText(10, 10, 'spacefont', '', 50);
    scoreText.render = function () {
        scoreText.text = 'Score: ' + score;
    };
    scoreText.render();

    //  Game over text
    // 屏幕中间游戏结束显示渲染
    gameOver = game.add.bitmapText(game.world.centerX, game.world.centerY, 'spacefont', 'GAME OVER!', 110);
    gameOver.x = gameOver.x - gameOver.textWidth / 2;
    gameOver.y = gameOver.y - gameOver.textHeight / 3;
    gameOver.visible = false;
}

// 游戏更新的方法
function update() {
    //  Scroll the background
    // 游戏背景垂直滚动
    starfield.tilePosition.y += 2;

    //  Reset the player, then check for movement keys
    // 重置玩家的水平加速度
    player.body.acceleration.x = 0;
    // 重置玩家的垂直加速度
    player.body.acceleration.y = 0;

    // 按下左
    if (cursors.left.isDown)
    {
        // 玩家水平加速度改变
        player.body.acceleration.x = -ACCLERATION;
    }
    // 按下右
    else if (cursors.right.isDown)
    {
        // 玩家水平加速度改变
        player.body.acceleration.x = ACCLERATION;
    }

    // 按下上
    if (cursors.up.isDown)
    {
        // 玩家水平加速度改变
        player.body.acceleration.y = -ACCLERATION;
    }
    // 按下下
    else if (cursors.down.isDown)
    {
        // 玩家水平加速度改变
        player.body.acceleration.y = ACCLERATION;
    }

    //  Stop at screen edges
    // 控制飞机的移动范围是屏幕两边50px之内的画面
    if (player.x > game.width - 50) {
        player.x = game.width - 50;
        player.body.acceleration.x = 0;
    }

    if (player.x < 50) {
        player.x = 50;
        player.body.acceleration.x = 0;
    }

    // 同上
    if (player.y > game.height - 50) {
        player.y = game.height - 50;
        player.body.acceleration.y = 0;
    }

    if (player.y < 50) {
        player.y = 50;
        player.body.acceleration.y = 0;
    }

    //  Fire bullet
    // 玩家存活并且按下开火按钮，则射出导弹
    if (player.alive && (fireButton.isDown || game.input.activePointer.isDown)) {
        fireBullet();
    }

    //  Move ship towards mouse pointer
    // 使玩家的飞船随鼠标移动
    if (game.input.x < game.width - 20 &&
        game.input.x > 20 &&
        game.input.y > 20 &&
        game.input.y < game.height - 20) {
        var minDist = 200;
        var dist = game.input.x - player.x;
        var disty = game.input.y - player.y;
        player.body.velocity.x = MAXSPEED * game.math.clamp(dist / minDist, -1, 1);
        // 增加了上下移动
        player.body.velocity.y = MAXSPEED * game.math.clamp(disty / minDist, -1, 1);
    }

    //  Squish and rotate ship for illusion of "banking"
    // 不太懂
    bank = player.body.velocity.x / MAXSPEED;
    player.scale.x = 2 - Math.abs(bank) / 2;
    player.angle = bank * 30;

    //  Keep the shipTrail lined up with the ship
    // 保持飞船的喷气特效和飞船轨迹一样
    shipTrail.x = player.x;
    shipTrail.y = player.y;

    //  Check collisions
    // 检查对象重叠（碰撞），玩家和绿色敌人重叠，执行shipCollide回调方法
    game.physics.arcade.overlap(player, greenEnemies, shipCollide, null, this);
    // 检查对象重叠（碰撞），绿色敌人和导弹重叠，执行hitEnemy回调方法
    game.physics.arcade.overlap(greenEnemies, bullets, hitEnemy, null, this);
    // 同上
    game.physics.arcade.overlap(player, blueEnemies, shipCollide, null, this);
    // 同上
    game.physics.arcade.overlap(blueEnemies, bullets, hitEnemy, null, this);

    // 检查boss和导弹重叠，当bossHitTest返回true时调用hitEnemy回调函数处理
    game.physics.arcade.overlap(boss, bullets, hitEnemy, bossHitTest, this);
    game.physics.arcade.overlap(player, boss.rayLeft, enemyHitsPlayer, null, this);
    game.physics.arcade.overlap(player, boss.rayRight, enemyHitsPlayer, null, this);
    game.physics.arcade.overlap(blueEnemyBullets, player, enemyHitsPlayer, null, this);

    //  Game over?
    // 判断游戏结束逻辑
    if (! player.alive && gameOver.visible === false) {
        gameOver.visible = true;
        gameOver.alpha = 0;
        var fadeInGameOver = game.add.tween(gameOver);
        fadeInGameOver.to({alpha: 1}, 1000, Phaser.Easing.Quintic.Out);
        fadeInGameOver.onComplete.add(setResetHandlers);
        fadeInGameOver.start();
        function setResetHandlers() {
            //  The "click to restart" handler
            tapRestart = game.input.onTap.addOnce(_restart,this);
            spaceRestart = fireButton.onDown.addOnce(_restart,this);
            function _restart() {
              tapRestart.detach();
              spaceRestart.detach();
              restart();
            }
        }
    }
}

function render() {
    // for (var i = 0; i < greenEnemies.length; i++)
    // {
    //     game.debug.body(greenEnemies.children[i]);
    // }
    // game.debug.body(player);
}

// 导弹飞行
function fireBullet() {
    // 玩家武器等级，等级1是单发，等级2是3连发
    switch (player.weaponLevel) {
        case 1:
        //  To avoid them being allowed to fire too fast we set a time limit
        // 限制导弹太快
        if (game.time.now > bulletTimer)
        {
            var BULLET_SPEED = 400;
            var BULLET_SPACING = 250;
            //  Grab the first bullet we can from the pool
            var bullet = bullets.getFirstExists(false);

            if (bullet)
            {
                //  And fire it
                //  Make bullet come out of tip of ship with right angle
                var bulletOffset = 20 * Math.sin(game.math.degToRad(player.angle));
                bullet.reset(player.x + bulletOffset, player.y);
                bullet.angle = player.angle;
                game.physics.arcade.velocityFromAngle(bullet.angle - 90, BULLET_SPEED, bullet.body.velocity);
                bullet.body.velocity.x += player.body.velocity.x;

                bulletTimer = game.time.now + BULLET_SPACING;
            }
        }
        break;

        case 2:
        if (game.time.now > bulletTimer) {
            var BULLET_SPEED = 400;
            var BULLET_SPACING = 550;


            for (var i = 0; i < 3; i++) {
                var bullet = bullets.getFirstExists(false);
                if (bullet) {
                    //  Make bullet come out of tip of ship with right angle
                    var bulletOffset = 20 * Math.sin(game.math.degToRad(player.angle));
                    bullet.reset(player.x + bulletOffset, player.y);
                    //  "Spread" angle of 1st and 3rd bullets
                    var spreadAngle;
                    if (i === 0) spreadAngle = -20;
                    if (i === 1) spreadAngle = 0;
                    if (i === 2) spreadAngle = 20;
                    bullet.angle = player.angle + spreadAngle;
                    game.physics.arcade.velocityFromAngle(spreadAngle - 90, BULLET_SPEED, bullet.body.velocity);
                    bullet.body.velocity.x += player.body.velocity.x;
                }
                bulletTimer = game.time.now + BULLET_SPACING;
            }
        }
    }
}

// 加载绿色敌人
function launchGreenEnemy() {
    var ENEMY_SPEED = 300;

    var enemy = greenEnemies.getFirstExists(false);
    if (enemy) {
        enemy.reset(game.rnd.integerInRange(0, game.width), -20);
        enemy.body.velocity.x = game.rnd.integerInRange(-300, 300);
        enemy.body.velocity.y = ENEMY_SPEED;
        enemy.body.drag.x = 100;

        enemy.trail.start(false, 800, 1);

        //  Update function for each enemy ship to update rotation etc
        enemy.update = function(){
          enemy.angle = 180 - game.math.radToDeg(Math.atan2(enemy.body.velocity.x, enemy.body.velocity.y));

          enemy.trail.x = enemy.x;
          enemy.trail.y = enemy.y -10;

          //  Kill enemies once they go off screen
          if (enemy.y > game.height + 200) {
            enemy.kill();
            enemy.y = -20;
          }
        }
    }

    //  Send another enemy soon
    greenEnemyLaunchTimer = game.time.events.add(game.rnd.integerInRange(greenEnemySpacing, greenEnemySpacing + 1000), launchGreenEnemy);
}

// 加载蓝色敌人
function launchBlueEnemy() {
    var startingX = game.rnd.integerInRange(100, game.width - 100);
    var verticalSpeed = 180;
    var spread = 60;
    var frequency = 70;
    var verticalSpacing = 70;
    var numEnemiesInWave = 5;

    //  Launch wave
    for (var i =0; i < numEnemiesInWave; i++) {
        var enemy = blueEnemies.getFirstExists(false);
        if (enemy) {
            enemy.startingX = startingX;
            enemy.reset(game.width / 2, -verticalSpacing * i);
            enemy.body.velocity.y = verticalSpeed;

            //  Set up firing
            var bulletSpeed = 400;
            var firingDelay = 2000;
            enemy.bullets = 1;
            enemy.lastShot = 0;

            //  Update function for each enemy
            enemy.update = function(){
              //  Wave movement
              this.body.x = this.startingX + Math.sin((this.y) / frequency) * spread;

              //  Squish and rotate ship for illusion of "banking"
              bank = Math.cos((this.y + 60) / frequency)
              this.scale.x = 0.5 - Math.abs(bank) / 8;
              this.angle = 180 - bank * 2;

              //  Fire
              enemyBullet = blueEnemyBullets.getFirstExists(false);
              if (enemyBullet &&
                  this.alive &&
                  this.bullets &&
                  this.y > game.width / 8 &&
                  game.time.now > firingDelay + this.lastShot) {
                    this.lastShot = game.time.now;
                    this.bullets--;
                    enemyBullet.reset(this.x, this.y + this.height / 2);
                    enemyBullet.damageAmount = this.damageAmount;
                    var angle = game.physics.arcade.moveToObject(enemyBullet, player, bulletSpeed);
                    enemyBullet.angle = game.math.radToDeg(angle);
                }

              //  Kill enemies once they go off screen
              if (this.y > game.height + 200) {
                this.kill();
                this.y = -20;
              }
            };
        }
    }

    //  Send another wave soon
    blueEnemyLaunchTimer = game.time.events.add(game.rnd.integerInRange(blueEnemySpacing, blueEnemySpacing + 4000), launchBlueEnemy);
}

// 加载boss
function launchBoss() {
    boss.reset(game.width / 2, -boss.height);
    booster.start(false, 1000, 10);
    boss.health = 501;
    bossBulletTimer = game.time.now + 5000;
}

// 给敌人增加发射器爆炸
function addEnemyEmitterTrail(enemy) {
    var enemyTrail = game.add.emitter(enemy.x, player.y - 10, 100);
    enemyTrail.width = 10;
    enemyTrail.makeParticles('explosion', [1,2,3,4,5]);
    enemyTrail.setXSpeed(20, -20);
    enemyTrail.setRotation(50,-50);
    enemyTrail.setAlpha(0.4, 0, 800);
    enemyTrail.setScale(0.01, 0.1, 0.01, 0.1, 1000, Phaser.Easing.Quintic.Out);
    enemy.trail = enemyTrail;
}

// 处理玩家和敌人重叠（碰撞）
function shipCollide(player, enemy) {
    enemy.kill();

    player.damage(enemy.damageAmount);
    shields.render();

    if (player.alive) {
        var explosion = explosions.getFirstExists(false);
        explosion.reset(player.body.x + player.body.halfWidth, player.body.y + player.body.halfHeight);
        explosion.alpha = 0.7;
        explosion.play('explosion', 30, false, true);
    } else {
        playerDeath.x = player.x;
        playerDeath.y = player.y;
        playerDeath.start(false, 1000, 10, 10);
    }
}

// 处理敌人吃到子弹
function hitEnemy(enemy, bullet) {
    var explosion = explosions.getFirstExists(false);
    explosion.reset(bullet.body.x + bullet.body.halfWidth, bullet.body.y + bullet.body.halfHeight);
    explosion.body.velocity.y = enemy.body.velocity.y;
    explosion.alpha = 0.7;
    explosion.play('explosion', 30, false, true);
    if (enemy.finishOff && enemy.health < 5) {
      enemy.finishOff();
    } else {
        enemy.damage(enemy.damageAmount);
    }
    bullet.kill();

    // Increase score
    score += enemy.damageAmount * 10;
    scoreText.render();

    //  Pacing

    //  Enemies come quicker as score increases
    // 得分越高绿色敌人出现越频繁
    greenEnemySpacing *= 0.9;

    //  Blue enemies come in after a score of 1000
    // 控制蓝色敌人在得分超过1000之后出现
    if (!blueEnemyLaunched && score > 1000) {
      blueEnemyLaunched = true;
      launchBlueEnemy();
      //  Slow green enemies down now that there are other enemies
      greenEnemySpacing *= 2;
    }

    //  Launch boss
    // 控制boss在得分超过15000之后出现
    if (!bossLaunched && score > 15000) {
        greenEnemySpacing = 5000;
        blueEnemySpacing = 12000;
        //  dramatic pause before boss
        game.time.events.add(2000, function(){
          bossLaunched = true;
          launchBoss();
        });
    }

    //  Weapon upgrade
    // 得分超过5000，武器等级升到2级3连发
    if (score > 5000 && player.weaponLevel < 2) {
      player.weaponLevel = 2;
    }
}

//  Don't count a hit in the lower right and left quarants to aproximate better collisions
// 处理boss吃到导弹
function bossHitTest(boss, bullet) {
    if ((bullet.x > boss.x + boss.width / 5 &&
        bullet.y > boss.y) ||
        (bullet.x < boss.x - boss.width / 5 &&
        bullet.y > boss.y)) {
      return false;
    } else {
      return true;
    }
}

// 处理敌人子弹和玩家重叠（碰撞）
function enemyHitsPlayer (player, bullet) {
    bullet.kill();

    player.damage(bullet.damageAmount);
    shields.render()

    if (player.alive) {
        var explosion = explosions.getFirstExists(false);
        explosion.reset(player.body.x + player.body.halfWidth, player.body.y + player.body.halfHeight);
        explosion.alpha = 0.7;
        explosion.play('explosion', 30, false, true);
    } else {
        playerDeath.x = player.x;
        playerDeath.y = player.y;
        playerDeath.start(false, 1000, 10, 10);
    }
}

// 游戏重新开始
function restart () {
    //  Reset the enemies
    greenEnemies.callAll('kill');
    game.time.events.remove(greenEnemyLaunchTimer);
    game.time.events.add(1000, launchGreenEnemy);
    blueEnemies.callAll('kill');
    blueEnemyBullets.callAll('kill');
    game.time.events.remove(blueEnemyLaunchTimer);
    boss.kill();
    booster.kill();
    game.time.events.remove(bossLaunchTimer);

    blueEnemies.callAll('kill');
    game.time.events.remove(blueEnemyLaunchTimer);
    //  Revive the player
    player.weaponLevel = 1;
    player.revive();
    player.health = 100;
    shields.render();
    score = 0;
    scoreText.render();

    //  Hide the text
    gameOver.visible = false;

    //  Reset pacing
    greenEnemySpacing = 1000;
    blueEnemyLaunched = false;
    bossLaunched = false;
}