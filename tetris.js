const boardWidth = 10;
const boardHeight = 20;
let board = [];
let currentPiece = null;
let currentPieceX = 0;
let currentPieceY = 0;
let score = 0;
let gameInterval;
const dropInterval = 700; // Milliseconds
const scoreDisplay = document.getElementById('score-display');
const leftButton = document.getElementById('left-button');
const rightButton = document.getElementById('right-button');
const rotateButton = document.getElementById('rotate-button');
const downButton = document.getElementById('down-button');


// Tetromino shapes (each element is a row, 1 represents a block)
const tetrominoes = [
  // I
  [
    [1, 1, 1, 1]
  ],
  // O
  [
    [1, 1],
    [1, 1]
  ],
  // T
  [
    [0, 1, 0],
    [1, 1, 1]
  ],
  // J
  [
    [1, 0, 0],
    [1, 1, 1]
  ],
  // L
  [
    [0, 0, 1],
    [1, 1, 1]
  ],
  // S
  [
    [0, 1, 1],
    [1, 1, 0]
  ],
  // Z
  [
    [1, 1, 0],
    [0, 1, 1]
  ]
];

// Colors for the tetrominoes (corresponding to the order above)
const tetrominoColors = [
    '#00FFFF', // Cyan (I)
    '#FFFF00', // Yellow (O)
    '#800080', // Purple (T)
    '#0000FF', // Blue (J)
    '#FFA500', // Orange (L)
    '#00FF00', // Green (S)
    '#FF0000'  // Red (Z)
];

const tetrominoImages = [
    'ketupat.png', // Ketupat (I)
    'banana.png', // Banana (O)
    'eggplant.png', // Eggplant (T)
    'peach.png', // Peach (J)
    'pineapple.png', // Pineapple (L)
    'avocado.png', // Avocado (S)
    'strawberry.png'  // Strawberry (Z)
];


function createBoard() {
  const boardTable = document.getElementById('game-board');
  boardTable.innerHTML = ''; // Clear the board
  for (let i = 0; i < boardHeight; i++) {
    const row = [];
    const tableRow = document.createElement('tr');
    for (let j = 0; j < boardWidth; j++) {
      row.push(0); // 0 represents an empty cell
      const cell = document.createElement('td');
      tableRow.appendChild(cell);
    }
    board.push(row);
    boardTable.appendChild(tableRow);
  }
}


function drawBoard() {
  const boardTable = document.getElementById('game-board');
  for (let i = 0; i < boardHeight; i++) {
    for (let j = 0; j < boardWidth; j++) {
      const cell = boardTable.rows[i].cells[j];
      cell.className = board[i][j] ? 'filled' : ''; // Add 'filled' class if not empty
    }
  }
}

function getRandomPiece() {
  const randomIndex = Math.floor(Math.random() * tetrominoes.length);
  return {
    shape: tetrominoes[randomIndex],
    color: tetrominoColors[randomIndex],
    image: tetrominoImages[randomIndex]
  };
}


function placeNewPiece() {
  currentPiece = getRandomPiece();
  currentPieceX = Math.floor(boardWidth / 2) - Math.floor(currentPiece.shape[0].length / 2); // Center
  currentPieceY = 0;

  // Check if the new piece overlaps existing blocks (game over condition)
  if (!isValidMove()) {
    gameOver();
    return;
  }
}


function isValidMove() {
  for (let y = 0; y < currentPiece.shape.length; y++) {
    for (let x = 0; x < currentPiece.shape[y].length; x++) {
      if (currentPiece.shape[y][x]) {
        const boardX = currentPieceX + x;
        const boardY = currentPieceY + y;

        // Check boundaries
        if (boardX < 0 || boardX >= boardWidth || boardY >= boardHeight) {
          return false;
        }

        // Check for collisions with existing blocks
        if (boardY >= 0 && board[boardY][boardX]) {
          return false;
        }
      }
    }
  }
  return true;
}


function drawPiece() {
    for (let y = 0; y < currentPiece.shape.length; y++) {
      for (let x = 0; x < currentPiece.shape[y].length; x++) {
        if (currentPiece.shape[y][x]) {
          const boardX = currentPieceX + x;
          const boardY = currentPieceY + y;

          if (boardY >= 0) { // Only draw within the board
            const cell = document.getElementById('game-board').rows[boardY].cells[boardX];
            cell.style.backgroundColor = currentPiece.color; // fallback or tint color
            cell.style.backgroundImage = `url(${currentPiece.image})`;
            cell.style.backgroundSize = "cover";
            cell.style.backgroundRepeat = "no-repeat";
            cell.style.backgroundPosition = "center";
          }
        }
      }
    }
}


function clearPiece() {
  for (let y = 0; y < currentPiece.shape.length; y++) {
    for (let x = 0; x < currentPiece.shape[y].length; x++) {
      if (currentPiece.shape[y][x]) {
        const boardX = currentPieceX + x;
        const boardY = currentPieceY + y;
          if (boardY >= 0) { // Only clear within the board
              const cell = document.getElementById('game-board').rows[boardY].cells[boardX];
              cell.style.backgroundColor = ''; // Clear color
              cell.style.backgroundImage = '';    // Clear the background image
          }
      }
    }
  }
}


function movePieceDown() {
  clearPiece();
  currentPieceY++;
  if (!isValidMove()) {
    currentPieceY--; // Revert the move
    freezePiece();
    return;
  }
  drawPiece();
}


function movePieceLeft() {
  clearPiece();
  currentPieceX--;
  if (!isValidMove()) {
    currentPieceX++; // Revert
  }
  drawPiece();
}


function movePieceRight() {
  clearPiece();
  currentPieceX++;
  if (!isValidMove()) {
    currentPieceX--; // Revert
  }
  drawPiece();
}


function rotatePiece() {
  clearPiece();
  const rotatedShape = [];

  // Rotate the shape 90 degrees clockwise
  for (let i = 0; i < currentPiece.shape[0].length; i++) {
    const row = [];
    for (let j = currentPiece.shape.length - 1; j >= 0; j--) {
      row.push(currentPiece.shape[j][i]);
    }
    rotatedShape.push(row);
  }


  const originalShape = currentPiece.shape;
  currentPiece.shape = rotatedShape;

  // Check if the rotated piece is valid (fits on the board)
  if (!isValidMove()) {
      // If not, revert the rotation
      currentPiece.shape = originalShape;
  }

  drawPiece();
}

function freezePiece() {
  for (let y = 0; y < currentPiece.shape.length; y++) {
    for (let x = 0; x < currentPiece.shape[y].length; x++) {
      if (currentPiece.shape[y][x]) {
        const boardX = currentPieceX + x;
        const boardY = currentPieceY + y;
        if (boardY >= 0) {
            board[boardY][boardX] = 1;  // Mark the cell as filled
        }
      }
    }
  }
  removeCompletedLines();
  placeNewPiece();
  drawBoard();
}


function removeCompletedLines() {
  let linesCleared = 0;
  for (let y = boardHeight - 1; y >= 0; y--) {
    if (board[y].every(cell => cell === 1)) {
      // Line is full, remove it and move everything above down
      board.splice(y, 1); // Remove the line
      board.unshift(new Array(boardWidth).fill(0)); // Add a new empty line at the top
      linesCleared++;
      y++;
    }
  }

  score += linesCleared * linesCleared * 100;
  scoreDisplay.textContent = score;
}

function gameOver() {
  clearInterval(gameInterval);
  alert(`Game Over! Score: ${score}`);
  // Optionally, you could reset the game here
  resetGame();
}


function resetGame() {
  board = [];
  score = 0;
  scoreDisplay.textContent = score;
  createBoard();
  drawBoard();
  placeNewPiece();
  startGameLoop(); // Restart the game
}


function startGameLoop() {
  if (gameInterval) {
    clearInterval(gameInterval); // Clear any existing interval
  }
  gameInterval = setInterval(() => {
    movePieceDown();
    drawBoard();
  }, dropInterval);
}

// Event listeners for controls
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowLeft':
            movePieceLeft();
            break;
        case 'ArrowRight':
            movePieceRight();
            break;
        case 'ArrowDown':
            movePieceDown();
            break;
        case 'ArrowUp': // Or a different key for rotate
            rotatePiece();
            break;
    }
    drawBoard();
});

// Touch/Button Controls
leftButton.addEventListener('click', movePieceLeft);
rightButton.addEventListener('click', movePieceRight);
rotateButton.addEventListener('click', rotatePiece);
downButton.addEventListener('click', movePieceDown);


// Initialize the game
createBoard();
placeNewPiece();
drawBoard();
startGameLoop();