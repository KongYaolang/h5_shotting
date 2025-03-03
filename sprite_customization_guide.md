# EverWing 游戏角色贴图修改指南

本指南将详细介绍如何通过替换或添加贴图来修改 EverWing 游戏中的各种角色渲染，包括主角（Guardian）、龙（Sidekick）、怪物（Monster）和 Boss。

## 目录

1. [准备工作](#准备工作)
2. [资源管理系统](#资源管理系统)
3. [修改主角（Guardian）](#修改主角guardian)
4. [修改龙助手（Sidekick）](#修改龙助手sidekick)
5. [修改怪物（Monster）](#修改怪物monster)
6. [修改 Boss](#修改-boss)
7. [添加动画效果](#添加动画效果)
8. [优化与性能提示](#优化与性能提示)

## 准备工作

### 创建图像资源

1. 准备所需的图像文件（PNG 格式推荐，支持透明背景）
2. 图像尺寸建议：
   - 主角：64px × 64px
   - 龙助手：48px × 48px
   - 普通怪物：48px × 48px
   - 精英怪物：64px × 64px
   - Boss：128px × 128px

### 创建资源文件夹

1. 在游戏根目录创建 `assets` 文件夹（如果不存在）
2. 在 `assets` 下创建以下子文件夹：
   ```
   assets/
   ├── guardian/
   ├── sidekicks/
   ├── monsters/
   └── boss/
   ```

## 资源管理系统

游戏使用 `AssetsManager` 类来管理所有图像资源。首先需要修改 `js/assets.js` 文件，添加新的图像资源。

### 修改 assets.js

```javascript
// 在 initDefaultAssets 方法中添加新的图像资源
initDefaultAssets() {
    // 主角图像
    this.loadImage('guardian', 'assets/guardian/guardian.png');
    
    // 龙助手图像
    this.loadImage('dragon_blue', 'assets/sidekicks/blue_dragon.png');
    this.loadImage('dragon_red', 'assets/sidekicks/red_dragon.png');
    this.loadImage('dragon_green', 'assets/sidekicks/green_dragon.png');
    
    // 怪物图像
    this.loadImage('monster_normal', 'assets/monsters/normal.png');
    this.loadImage('monster_elite', 'assets/monsters/elite.png');
    this.loadImage('monster_minion', 'assets/monsters/minion.png');
    
    // Boss 图像
    this.loadImage('boss_level1', 'assets/boss/boss_level1.png');
    this.loadImage('boss_level2', 'assets/boss/boss_level2.png');
}
```

## 修改主角（Guardian）

### 1. 准备主角图像

创建主角图像并放入 `assets/guardian/` 文件夹。

### 2. 修改 Guardian 类的 draw 方法

打开 `js/guardian.js` 文件，找到 `draw` 方法，修改为使用图像而非形状绘制：

```javascript
draw(context) {
    // 获取主角图像
    const guardianImage = window.assetsManager.getImage('guardian');
    
    if (guardianImage) {
        // 使用图像绘制主角
        context.drawImage(
            guardianImage,
            this.x,
            this.y,
            this.width,
            this.height
        );
        
        // 如果有无敌效果，添加发光效果
        if (this.invincible) {
            context.save();
            context.globalAlpha = 0.5;
            context.shadowColor = '#3498db';
            context.shadowBlur = 15;
            context.drawImage(
                guardianImage,
                this.x,
                this.y,
                this.width,
                this.height
            );
            context.restore();
        }
    } else {
        // 回退到原始的形状绘制方法
        // 原有的绘制代码...
    }
    
    // 绘制龙助手
    if (this.leftSidekick) {
        this.leftSidekick.draw(context);
    }
    
    if (this.rightSidekick) {
        this.rightSidekick.draw(context);
    }
}
```

## 修改龙助手（Sidekick）

### 1. 准备龙助手图像

为每种类型的龙创建图像，并放入 `assets/sidekicks/` 文件夹。

### 2. 修改 Sidekick 类的 draw 方法

打开 `js/sidekick.js` 文件，找到 `draw` 方法，修改为使用图像绘制：

```javascript
draw(context) {
    // 根据龙的类型选择对应的图像
    let dragonImage;
    switch (this.type) {
        case 'blue':
            dragonImage = window.assetsManager.getImage('dragon_blue');
            break;
        case 'red':
            dragonImage = window.assetsManager.getImage('dragon_red');
            break;
        case 'green':
            dragonImage = window.assetsManager.getImage('dragon_green');
            break;
        default:
            dragonImage = window.assetsManager.getImage('dragon_blue');
    }
    
    if (dragonImage) {
        // 使用图像绘制龙助手
        context.drawImage(
            dragonImage,
            this.x,
            this.y,
            this.width,
            this.height
        );
        
        // 绘制等级指示器
        this.drawLevelIndicator(context, this.x, this.y);
    } else {
        // 回退到原始的形状绘制方法
        // 原有的绘制代码...
    }
}
```

## 修改怪物（Monster）

### 1. 准备怪物图像

为不同类型的怪物创建图像，并放入 `assets/monsters/` 文件夹。

### 2. 修改 Monster 类的 draw 方法

打开 `js/monster.js` 文件，找到 `draw` 方法，修改为使用图像绘制：

```javascript
draw(context) {
    if (!this.active) return;
    
    // 根据怪物类型选择对应的图像
    let monsterImage;
    switch (this.type) {
        case 'elite':
            monsterImage = window.assetsManager.getImage('monster_elite');
            break;
        case 'minion':
            monsterImage = window.assetsManager.getImage('monster_minion');
            break;
        case 'boss':
            // Boss 使用单独的 Boss 图像
            monsterImage = window.assetsManager.getImage(`boss_level${Math.ceil(this.wave / 10)}`);
            break;
        default:
            monsterImage = window.assetsManager.getImage('monster_normal');
    }
    
    if (monsterImage) {
        // 使用图像绘制怪物
        context.drawImage(
            monsterImage,
            this.x,
            this.y,
            this.width,
            this.height
        );
        
        // 绘制生命条
        this.drawHealthBar(context);
    } else {
        // 回退到原始的形状绘制方法
        // 原有的绘制代码...
    }
}

// 添加绘制生命条的方法
drawHealthBar(context) {
    const healthPercentage = this.health / this.maxHealth;
    const barWidth = this.width * 0.8;
    const barHeight = 5;
    const barX = this.x + (this.width - barWidth) / 2;
    const barY = this.y - 10;
    
    // 绘制背景
    context.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.drawRoundedRect(context, barX, barY, barWidth, barHeight, 2);
    
    // 绘制生命值
    context.fillStyle = this.getHealthColor(healthPercentage);
    this.drawRoundedRect(context, barX, barY, barWidth * healthPercentage, barHeight, 2);
}
```

## 修改 Boss

Boss 可以使用与普通怪物相同的方法，但通常需要更大的图像和更复杂的动画。

### 1. 准备 Boss 图像

为不同等级的 Boss 创建图像，并放入 `assets/boss/` 文件夹。

### 2. 修改 Boss 类的 draw 方法（如果有单独的 Boss 类）

如果游戏中有单独的 `Boss` 类，修改其 `draw` 方法：

```javascript
draw(context) {
    // 根据 Boss 等级选择对应的图像
    const bossImage = window.assetsManager.getImage(`boss_level${this.level}`);
    
    if (bossImage) {
        // 使用图像绘制 Boss
        context.drawImage(
            bossImage,
            this.x,
            this.y,
            this.width,
            this.height
        );
        
        // 绘制生命条
        const healthPercentage = this.health / this.maxHealth;
        const barWidth = this.width * 0.8;
        const barHeight = 8;
        const barX = this.x + (this.width - barWidth) / 2;
        const barY = this.y - 15;
        
        // 绘制背景
        context.fillStyle = 'rgba(0, 0, 0, 0.5)';
        context.fillRect(barX, barY, barWidth, barHeight);
        
        // 绘制生命值
        context.fillStyle = this.getHealthColor(healthPercentage);
        context.fillRect(barX, barY, barWidth * healthPercentage, barHeight);
    } else {
        // 回退到原始的形状绘制方法
        // 原有的绘制代码...
    }
}
```

## 添加动画效果

要为角色添加动画效果，需要使用精灵图（Sprite Sheet）。

### 1. 创建精灵图

精灵图是包含多个动画帧的单一图像。例如，一个 4 帧的主角动画可能是一个 256px × 64px 的图像，每帧 64px × 64px。

### 2. 修改绘制方法以支持动画

以主角为例：

```javascript
constructor(x, y) {
    // 现有的构造函数代码...
    
    // 添加动画相关属性
    this.frameWidth = 64;  // 每帧宽度
    this.frameHeight = 64; // 每帧高度
    this.totalFrames = 4;  // 总帧数
    this.currentFrame = 0; // 当前帧
    this.animationSpeed = 0.1; // 动画速度
}

update(canvasWidth) {
    // 现有的更新代码...
    
    // 更新动画帧
    this.currentFrame = (this.currentFrame + this.animationSpeed) % this.totalFrames;
}

draw(context) {
    const guardianImage = window.assetsManager.getImage('guardian');
    
    if (guardianImage) {
        // 计算当前帧在精灵图中的位置
        const frameX = Math.floor(this.currentFrame) * this.frameWidth;
        
        // 绘制当前帧
        context.drawImage(
            guardianImage,
            frameX, 0, // 源图像中的位置
            this.frameWidth, this.frameHeight, // 源图像中的尺寸
            this.x, this.y, // 目标位置
            this.width, this.height // 目标尺寸
        );
    } else {
        // 回退代码...
    }
    
    // 绘制龙助手...
}
```

## 优化与性能提示

1. **预加载图像**：确保在游戏开始前加载所有图像资源。

2. **图像尺寸**：使用合适大小的图像，过大的图像会影响性能。

3. **精灵图**：使用精灵图可以减少图像加载次数，提高性能。

4. **缓存**：对频繁使用的图像进行缓存，避免重复获取。

5. **回退机制**：始终提供回退到原始绘制方法的选项，以防图像加载失败。

6. **响应式设计**：确保图像在不同屏幕尺寸下正确缩放。

```javascript
// 在 Game 类中添加响应式缩放
resizeSprites() {
    const scale = Math.min(this.canvas.width / 400, this.canvas.height / 600);
    
    // 调整主角尺寸
    this.guardian.width = 64 * scale;
    this.guardian.height = 64 * scale;
    
    // 调整怪物尺寸
    for (const monster of this.monsters) {
        if (monster.type === 'boss') {
            monster.width = 128 * scale;
            monster.height = 128 * scale;
        } else {
            monster.width = 48 * scale;
            monster.height = 48 * scale;
        }
    }
}
```

## 实现步骤总结

1. 创建所需的图像资源
2. 修改 `assets.js` 添加图像加载
3. 修改各个角色类的 `draw` 方法，使用图像替代形状绘制
4. 为需要动画的角色添加精灵图支持
5. 添加响应式设计，确保在不同屏幕尺寸下正确显示
6. 测试并优化性能

按照本指南操作，您可以成功地将 EverWing 游戏中的所有角色从形状绘制替换为图像贴图渲染，使游戏视觉效果更加丰富和专业。 