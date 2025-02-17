const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const box = 20;
let score = 0;
let highestScore = localStorage.getItem('highestScore') ? parseInt(localStorage.getItem('highestScore')) : 0;
let gameOver = false;
let gamePaused = false;
let snake;
let direction;
let food;
let swipeStart = null;
let game;

// Initialize Game
function initGame() {
    snake = [{ x: 9 * box, y: 10 * box }];
    direction = 'RIGHT';
    food = {
        x: Math.floor(Math.random() * 19 + 1) * box,
        y: Math.floor(Math.random() * 19 + 1) * box
    };
    score = 0;
    gameOver = false;
    gamePaused = false;
    document.getElementById('restartBtn').style.display = 'none';
    document.getElementById('pauseBtn').textContent = 'Pause';
    updateScore();
    clearInterval(game);
    game = setInterval(draw, 100);
}

// Pause the Game
document.getElementById('pauseBtn').addEventListener('click', () => {
    if (gameOver) return;
    if (gamePaused) {
        gamePaused = false;
        document.getElementById('pauseBtn').textContent = 'Pause';
        game = setInterval(draw, 100);
    } else {
        gamePaused = true;
        document.getElementById('pauseBtn').textContent = 'Resume';
        clearInterval(game);
    }
});

// Restart Game
document.getElementById('restartBtn').addEventListener('click', initGame);

// Detect Mobile vs Desktop
if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    // Mobile (Touch) - Swipe Controls
    canvas.addEventListener('touchstart', touchStartHandler);
    canvas.addEventListener('touchend', touchEndHandler);
} else {
    // Desktop - Arrow Key Controls
    document.addEventListener('keydown', directionControl);
}

function directionControl(event) {
    if (gameOver || gamePaused) return;

    if (event.keyCode == 37 && direction != 'RIGHT') {
        direction = 'LEFT';
    } else if (event.keyCode == 38 && direction != 'DOWN') {
        direction = 'UP';
    } else if (event.keyCode == 39 && direction != 'LEFT') {
        direction = 'RIGHT';
    } else if (event.keyCode == 40 && direction != 'UP') {
        direction = 'DOWN';
    }
}

function touchStartHandler(event) {
    if (gameOver || gamePaused) return;
    swipeStart = event.changedTouches[0];
}

function touchEndHandler(event) {
    if (!swipeStart || gameOver || gamePaused) return;

    const swipeEnd = event.changedTouches[0];
    const dx = swipeEnd.pageX - swipeStart.pageX;
    const dy = swipeEnd.pageY - swipeStart.pageY;

    if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal swipe
        if (dx > 0 && direction !== 'LEFT') direction = 'RIGHT';
        if (dx < 0 && direction !== 'RIGHT') direction = 'LEFT';
    } else {
        // Vertical swipe
        if (dy > 0 && direction !== 'UP') direction = 'DOWN';
        if (dy < 0 && direction !== 'DOWN') direction = 'UP';
    }

    swipeStart = null;
}

// Draw everything on the canvas
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Snake
    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = i === 0 ? 'green' : 'lightgreen';
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
    }

    // Draw Food
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x, food.y, box, box);

    // Snake Movement Logic
    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (direction === 'LEFT') snakeX -= box;
    if (direction === 'UP') snakeY -= box;
    if (direction === 'RIGHT') snakeX += box;
    if (direction === 'DOWN') snakeY += box;

    // Snake Eats Food
    if (snakeX === food.x && snakeY === food.y) {
        food = {
            x: Math.floor(Math.random() * 19 + 1) * box,
            y: Math.floor(Math.random() * 19 + 1) * box
        };
        score++;
        updateScore();
    } else {
        snake.pop();
    }

    const newHead = {
        x: snakeX,
        y: snakeY
    };

    // Check for Collision with Walls or Itself
    if (snakeX < 0 || snakeX >= canvas.width || snakeY < 0 || snakeY >= canvas.height || collision(newHead, snake)) {
        gameOver = true;
        document.getElementById('restartBtn').style.display = 'block';
        if (score > highestScore) {
            highestScore = score;
            localStorage.setItem('highestScore', highestScore); // Save new highest score
        }
        clearInterval(game);
        alert('Game Over!');
    }

    snake.unshift(newHead);
}

// Check if Snake Collides with Itself
function collision(head, array) {
    for (let i = 0; i < array.length; i++) {
        if (head.x === array[i].x && head.y === array[i].y) {
            return true;
        }
    }
    return false;
}

// Update Score
function updateScore() {
    document.getElementById('score').textContent = 'Score: ' + score + ' | Highest: ' + highestScore;
}

// Start the Game
initGame();
