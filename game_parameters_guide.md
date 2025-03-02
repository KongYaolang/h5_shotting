 # EverWing 游戏参数调整指南

本文档提供了如何调整 EverWing 游戏中各种参数的指导，以便自定义游戏难度和游戏体验。通过调整这些参数，您可以使游戏更具挑战性或更容易，也可以改变游戏的整体平衡性。

## 目录

1. [Boss 相关参数](#boss-相关参数)
2. [怪物相关参数](#怪物相关参数)
3. [玩家相关参数](#玩家相关参数)
4. [道具相关参数](#道具相关参数)
5. [游戏节奏参数](#游戏节奏参数)
6. [视觉效果参数](#视觉效果参数)

## Boss 相关参数

### Boss 生命值

```javascript
// 在 Monster 构造函数中 (js/monster.js)
this.health = 80 + Math.floor(wave / 5) * 20; // 基础生命值 + 每5波增加20
```

调整建议:
- 增加基础值 (80) 使 Boss 更耐打
- 减小基础值使 Boss 更容易击败
- 调整增量值 (20) 和增量频率 (5) 来改变游戏难度随波数的增长速度

### Boss 攻击频率

```javascript
// 在 Monster 构造函数中 (js/monster.js)
this.attackInterval = 120; // 每2秒攻击一次 (60fps)

// 在 shouldAttack 方法中 (js/monster.js)
if (healthPercentage < 0.3) {
    attackInterval = 45; // 低生命值时每0.75秒攻击一次
} else if (healthPercentage < 0.6) {
    attackInterval = 75; // 中等生命值时每1.25秒攻击一次
}
```

调整建议:
- 增加 attackInterval 值使 Boss 攻击频率降低
- 减小 attackInterval 值使 Boss 攻击频率提高
- 调整生命值百分比阈值 (0.3, 0.6) 来改变 Boss 行为变化的时机

### Boss 移动速度

```javascript
// 在 Monster 构造函数中 (js/monster.js)
this.speed = 0.8;

// 在 update 方法中 (js/monster.js)
let moveSpeed = this.speed * 0.8;
// 低生命值时更快
if (healthPercentage < 0.3) {
    moveSpeed = this.speed * 1.5;
} else if (healthPercentage < 0.6) {
    moveSpeed = this.speed * 1.2;
}
```

调整建议:
- 增加基础速度 (0.8) 使 Boss 移动更快
- 调整速度乘数 (0.8, 1.2, 1.5) 来改变不同生命值阶段的移动速度

### Boss 子弹速度和数量

```javascript
// 在 createAttack 方法中 (js/monster.js)
let bulletCount = 5; // 默认子弹数量
let bulletSpeed = 3; // 默认子弹速度

// 根据生命值调整难度
if (healthPercentage < 0.3) {
    bulletCount = 9; // 低生命值时更多子弹
    bulletSpeed = 120;
} else if (healthPercentage < 0.6) {
    bulletCount = 7; // 中等难度
    bulletSpeed = 200;
}
```

调整建议:
- 增加/减少 bulletCount 来改变子弹数量
- 调整 bulletSpeed 来改变子弹速度
- 修改特殊攻击模式的概率 (attackPattern < 0.4, attackPattern < 0.3)

## 怪物相关参数

### 怪物生命值

```javascript
// 在 Monster 构造函数中 (js/monster.js)
// 普通怪物
this.health = 5 + Math.floor(wave / 10) * 2; // 基础生命值 + 每10波增加2

// 精英怪物
this.health = 10 + Math.floor(wave / 10) * 5; // 基础生命值 + 每10波增加5

// 小怪
this.health = 3 + Math.floor(wave / 10); // 基础生命值 + 每10波增加1
```

调整建议:
- 调整基础生命值 (5, 10, 3) 来改变怪物的初始难度
- 修改增量值 (2, 5, 1) 和增量频率 (10) 来改变难度随波数的增长速度

### 怪物移动速度

```javascript
// 在 Monster 构造函数中 (js/monster.js)
// 普通怪物
this.speed = 2;

// 精英怪物
this.speed = 1.5;

// 小怪
this.speed = 2.5;
```

调整建议:
- 增加/减少速度值来改变怪物下落速度
- 可以为不同类型的怪物设置不同的速度以创造多样性

### 怪物生成频率

```javascript
// 在 MonsterFactory.createWave 方法中 (js/monster.js)
// Boss 波次频率
if (wave % 5 === 0) { // 每5波生成一个 Boss
```

调整建议:
- 修改 Boss 出现频率 (5) 使 Boss 更频繁或更少出现
- 调整每波怪物数量 (count = 5) 来改变怪物密度

### 怪物类型分布

```javascript
// 在 MonsterFactory.createWave 方法中 (js/monster.js)
let eliteChance = Math.min(0.1 + (wave * 0.02), 0.4); // 精英怪物出现概率
let minionChance = Math.min(0.15 + (wave * 0.01), 0.3); // 小怪出现概率
```

调整建议:
- 调整基础概率 (0.1, 0.15) 来改变游戏初期的怪物分布
- 修改增长率 (0.02, 0.01) 来改变怪物分布随波数的变化速度
- 调整最大概率 (0.4, 0.3) 来限制特定类型怪物的最大出现率

## 玩家相关参数

### 玩家移动速度

```javascript
// 在 Guardian 构造函数中 (js/guardian.js)
this.speed = 8; // 移动速度
this.smoothingFactor = 0.3; // 移动平滑因子
```

调整建议:
- 增加/减少 speed 来改变玩家移动速度
- 调整 smoothingFactor 来改变移动的响应性 (较高的值使移动更快但可能不够平滑)

### 玩家攻击速度

```javascript
// 在 Guardian 构造函数中 (js/guardian.js)
this.shootInterval = 12; // 射击间隔 (12帧 = 60fps下的0.2秒)
```

调整建议:
- 减小 shootInterval 使玩家射击更频繁
- 增加 shootInterval 使玩家射击更慢

### 玩家初始生命值

```javascript
// 在 Game.resetGame 方法中 (js/game.js)
this.lives = 3; // 初始生命值
```

调整建议:
- 增加/减少初始生命值来改变游戏难度
- 调整最大生命值上限 (if (this.lives < 5))

### 龙助手参数

```javascript
// 在 Sidekick 构造函数中 (js/sidekick.js)
this.shootInterval = 30; // 射击间隔 (30帧 = 60fps下的0.5秒)
```

调整建议:
- 调整 shootInterval 来改变龙助手的攻击频率
- 修改龙助手的伤害值 (this.damage = level)

## 道具相关参数

### 道具掉落率

```javascript
// 在 ItemDropManager.calculateDropChance 方法中 (js/item.js)
// 基础掉落概率
let baseChance = 0.3; // 30% 基础掉落率

// 临时强化道具掉落概率
let tempPowerupChance = 0.15; // 15% 概率掉落临时强化道具

// 永久升级道具掉落概率
let permUpgradeChance = 0.05; // 5% 概率掉落永久升级道具
```

调整建议:
- 调整基础掉落率 (0.3) 来改变整体道具掉落频率
- 修改特定类型道具的掉落率 (0.15, 0.05) 来平衡游戏

### 强化道具持续时间

```javascript
// 在 Game 类的碰撞检测中 (js/game.js)
// 无敌护盾
this.powerupEffects.shield.duration = 300; // 5秒 (60fps)

// 伤害加成
this.powerupEffects.damage.duration = 600; // 10秒 (60fps)

// 龙怒
this.powerupEffects.dragonRage.duration = 300; // 5秒 (60fps)

// 金币磁铁
this.powerupEffects.coinMagnet.duration = 900; // 15秒 (60fps)
```

调整建议:
- 增加/减少持续时间来改变强化道具的效果时长
- 调整效果倍率 (如 damage.multiplier = 2, dragonRage.multiplier = 1.5)

### 永久升级需求

```javascript
// 在 Game 类的碰撞检测中 (js/game.js)
// 武器升级需求
if (this.permanentUpgrades.weaponFragments >= 10) // 需要10个武器碎片

// 龙助手升级需求
if (this.permanentUpgrades.dragonSouls >= 5) // 需要5个龙魂

// 生命值升级需求
if (this.permanentUpgrades.lifeCrystals >= 5) // 需要5个生命水晶
```

调整建议:
- 增加/减少升级所需的道具数量来调整游戏进度速度
- 调整最大升级限制 (如 if (this.lives < 5))

## 游戏节奏参数

### 波次生成

```javascript
// 在 Game.startNewWave 方法中 (js/game.js)
// 新波次生成逻辑
```

调整建议:
- 修改波次之间的时间间隔
- 调整波次提示的显示时间 (60)

### 得分系统

```javascript
// 在 Game.update 方法中 (js/game.js)
// 击败怪物得分
this.score += monster.health * 10;
```

调整建议:
- 调整得分倍率 (10) 来改变得分速度
- 为不同类型的怪物设置不同的得分倍率

## 视觉效果参数

### 粒子效果

```javascript
// 在 Game 类中的各种粒子效果创建方法
this.particleSystem.createExplosion(
    x, y, color, count // 粒子数量
);
```

调整建议:
- 调整粒子数量来改变视觉效果的密度
- 修改粒子的生命周期和大小

### Boss 子弹视觉效果

```javascript
// 在 Game.draw 方法中 (js/game.js)
// Boss 子弹的视觉效果
this.context.shadowBlur = 15 + pulseSize;
this.context.shadowColor = '#ff3333';
```

调整建议:
- 调整阴影模糊值 (shadowBlur) 来改变发光效果的强度
- 修改脉冲大小和速度 (pulseSize = Math.sin(this.gameTime * 0.2) * 2)

## 总结

通过调整上述参数，您可以显著改变游戏的难度和游戏体验。建议一次只调整少量参数，然后测试效果，以便更好地理解每个参数对游戏平衡的影响。

对于更高级的自定义，您可能需要修改游戏逻辑或添加新功能，这将需要更深入地编辑代码。