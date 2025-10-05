// 游戏常量
const GRID_SIZE = 20; // 网格大小
const CELL_SIZE = 20; // 每个单元格的大小
const INITIAL_SPEED = 150; // 初始速度（毫秒）
const SPEED_INCREASE = 10; // 每升一级速度增加的毫秒数
const MIN_SPEED = 50; // 最小速度

// 游戏变量
let canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let score = 0;
let level = 1;
let gameInterval = null;
let gameRunning = false;
let gameSpeed = INITIAL_SPEED;

// DOM元素
let scoreElement = document.getElementById('score');
let levelElement = document.getElementById('level');
let startBtn = document.getElementById('startBtn');
let pauseBtn = document.getElementById('pauseBtn');
let restartBtn = document.getElementById('restartBtn');
let directionButtons = document.querySelectorAll('.dir-btn');

// 初始化游戏
function initGame() {
    // 设置蛇的初始位置
    snake = [
        {x: 10, y: 10},
        {x: 9, y: 10},
        {x: 8, y: 10}
    ];
    
    // 随机生成食物位置
    generateFood();
    
    // 重置游戏状态
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    level = 1;
    gameSpeed = INITIAL_SPEED;
    gameRunning = false;
    
    // 更新UI
    updateScore();
    updateLevel();
    
    // 绘制初始游戏画面
    draw();
}

// 开始游戏
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        // 清除之前的游戏循环
        if (gameInterval) {
            clearInterval(gameInterval);
        }
        // 设置新的游戏循环
        gameInterval = setInterval(gameLoop, gameSpeed);
    }
}

// 暂停游戏
function pauseGame() {
    if (gameRunning) {
        gameRunning = false;
        clearInterval(gameInterval);
        drawPauseScreen();
    }
}

// 重新开始游戏
function restartGame() {
    clearInterval(gameInterval);
    initGame();
}

// 游戏主循环
function gameLoop() {
    moveSnake();
    if (checkCollision()) {
        gameOver();
        return;
    }
    checkFood();
    draw();
}

// 移动蛇
function moveSnake() {
    direction = nextDirection;
    
    // 获取蛇头位置
    let head = {x: snake[0].x, y: snake[0].y};
    
    // 根据方向移动蛇头
    switch (direction) {
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
        case 'left':
            head.x--;
            break;
        case 'right':
            head.x++;
            break;
    }
    
    // 将新的头部添加到蛇数组的开头
    snake.unshift(head);
    
    // 如果没有吃到食物，移除尾部
    // （吃到食物的逻辑在checkFood函数中处理）
}

// 生成食物
function generateFood() {
    // 随机生成食物位置，确保不在蛇身上
    let foodX, foodY;
    do {
        foodX = Math.floor(Math.random() * GRID_SIZE);
        foodY = Math.floor(Math.random() * GRID_SIZE);
    } while (isOnSnake(foodX, foodY));
    
    food = {x: foodX, y: foodY};
}

// 检查食物是否被吃到
function checkFood() {
    // 如果蛇头碰到食物
    if (snake[0].x === food.x && snake[0].y === food.y) {
        // 增加分数
        score += 10;
        updateScore();
        
        // 检查是否升级
        if (score % 50 === 0) {
            levelUp();
        }
        
        // 生成新食物
        generateFood();
    } else {
        // 如果没有吃到食物，移除尾部
        snake.pop();
    }
}

// 升级
function levelUp() {
    level++;
    updateLevel();
    
    // 增加游戏速度（减少间隔时间）
    if (gameSpeed > MIN_SPEED) {
        gameSpeed = Math.max(MIN_SPEED, gameSpeed - SPEED_INCREASE);
        
        // 如果游戏正在运行，更新游戏循环
        if (gameRunning) {
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, gameSpeed);
        }
    }
    
    // 显示升级信息
    drawLevelUpMessage();
}

// 检查碰撞
function checkCollision() {
    let head = snake[0];
    
    // 检查是否撞到墙壁
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        return true;
    }
    
    // 检查是否撞到自己
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// 检查坐标是否在蛇身上
function isOnSnake(x, y) {
    for (let segment of snake) {
        if (segment.x === x && segment.y === y) {
            return true;
        }
    }
    return false;
}

// 游戏结束
function gameOver() {
    gameRunning = false;
    clearInterval(gameInterval);
    drawGameOverScreen();
}

// 绘制游戏
function draw() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制蛇
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#e74c3c' : '#3498db'; // 蛇头红色，身体蓝色
        ctx.fillRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        
        // 绘制边框
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        ctx.strokeRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    });
    
    // 绘制食物
    ctx.fillStyle = '#e67e22';
    ctx.fillRect(food.x * CELL_SIZE, food.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    
    // 绘制食物边框
    ctx.strokeStyle = '#d35400';
    ctx.lineWidth = 2;
    ctx.strokeRect(food.x * CELL_SIZE, food.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

// 绘制游戏结束画面
function drawGameOverScreen() {
    // 绘制半透明黑色背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制游戏结束文本
    ctx.fillStyle = '#e74c3c';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('游戏结束', canvas.width / 2, canvas.height / 2 - 30);
    
    ctx.fillStyle = '#ecf0f1';
    ctx.font = '20px Arial';
    ctx.fillText('最终得分: ' + score, canvas.width / 2, canvas.height / 2);
    ctx.fillText('按重新开始按钮继续', canvas.width / 2, canvas.height / 2 + 30);
}

// 绘制暂停画面
function drawPauseScreen() {
    // 绘制半透明黑色背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制暂停文本
    ctx.fillStyle = '#f39c12';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('游戏暂停', canvas.width / 2, canvas.height / 2 - 15);
    ctx.fillText('按开始按钮继续', canvas.width / 2, canvas.height / 2 + 15);
}

// 绘制升级信息
function drawLevelUpMessage() {
    // 保存当前画布状态
    ctx.save();
    
    // 绘制半透明背景
    ctx.fillStyle = 'rgba(46, 204, 113, 0.8)';
    ctx.fillRect(canvas.width / 4, canvas.height / 2 - 25, canvas.width / 2, 50);
    
    // 绘制升级文本
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('升级了！等级 ' + level, canvas.width / 2, canvas.height / 2 + 8);
    
    // 恢复画布状态
    ctx.restore();
    
    // 短暂显示后恢复正常绘制
    setTimeout(() => {
        if (gameRunning) {
            draw();
        }
    }, 1000);
}

// 更新分数显示
function updateScore() {
    scoreElement.textContent = score;
}

// 更新等级显示
function updateLevel() {
    levelElement.textContent = level;
}

// 设置键盘控制
function setupKeyboardControls() {
    document.addEventListener('keydown', (e) => {
        // 防止方向键滚动页面
        if ([37, 38, 39, 40].includes(e.keyCode)) {
            e.preventDefault();
        }
        
        // 根据按键设置下一个方向
        switch (e.keyCode) {
            case 37: // 左箭头
                if (direction !== 'right') {
                    nextDirection = 'left';
                }
                break;
            case 38: // 上箭头
                if (direction !== 'down') {
                    nextDirection = 'up';
                }
                break;
            case 39: // 右箭头
                if (direction !== 'left') {
                    nextDirection = 'right';
                }
                break;
            case 40: // 下箭头
                if (direction !== 'up') {
                    nextDirection = 'down';
                }
                break;
            case 32: // 空格键（暂停/继续）
                if (gameRunning) {
                    pauseGame();
                } else {
                    startGame();
                }
                break;
        }
    });
}

// 设置按钮控制
function setupButtonControls() {
    // 开始按钮
    startBtn.addEventListener('click', startGame);
    
    // 暂停按钮
    pauseBtn.addEventListener('click', pauseGame);
    
    // 重新开始按钮
    restartBtn.addEventListener('click', restartGame);
    
    // 方向按钮
    directionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const newDirection = button.getAttribute('data-direction');
            // 确保不能直接反向移动
            if ((newDirection === 'up' && direction !== 'down') ||
                (newDirection === 'down' && direction !== 'up') ||
                (newDirection === 'left' && direction !== 'right') ||
                (newDirection === 'right' && direction !== 'left')) {
                nextDirection = newDirection;
            }
        });
    });
}

// 设置触摸控制（移动设备）
function setupTouchControls() {
    let touchStartX = 0;
    let touchStartY = 0;
    
    canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        e.preventDefault(); // 防止触摸滚动
    }, {passive: false});
    
    canvas.addEventListener('touchend', (e) => {
        if (!gameRunning) return;
        
        let touchEndX = e.changedTouches[0].clientX;
        let touchEndY = e.changedTouches[0].clientY;
        
        // 计算滑动方向
        let dx = touchEndX - touchStartX;
        let dy = touchEndY - touchStartY;
        
        // 判断是水平滑动还是垂直滑动
        if (Math.abs(dx) > Math.abs(dy)) {
            // 水平滑动
            if (dx > 0 && direction !== 'left') {
                nextDirection = 'right';
            } else if (dx < 0 && direction !== 'right') {
                nextDirection = 'left';
            }
        } else {
            // 垂直滑动
            if (dy > 0 && direction !== 'up') {
                nextDirection = 'down';
            } else if (dy < 0 && direction !== 'down') {
                nextDirection = 'up';
            }
        }
        
        e.preventDefault(); // 防止触摸滚动
    }, {passive: false});
}

// 初始化游戏
window.onload = function() {
    setupKeyboardControls();
    setupButtonControls();
    setupTouchControls();
    initGame();
};