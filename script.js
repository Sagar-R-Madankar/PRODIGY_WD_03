const cells = document.querySelectorAll('.cell');
const statusDisplay = document.querySelector('#status');
const resetButton = document.querySelector('#reset-button');
const newGameButton = document.querySelector('#new-game-button');
const singlePlayerButton = document.querySelector('#single-player-button');
const twoPlayerButton = document.querySelector('#two-player-button');
const gameModeButtons = document.querySelector('#game-mode');
const gameBoard = document.querySelector('#game');

let currentPlayer = 'X';
let gameState = ['', '', '', '', '', '', '', '', ''];
let singlePlayerMode = false;

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

singlePlayerButton.addEventListener('click', () => {
    singlePlayerMode = true;
    startGame();
});

twoPlayerButton.addEventListener('click', () => {
    singlePlayerMode = false;
    startGame();
});

resetButton.addEventListener('click', resetGame);
newGameButton.addEventListener('click', () => {
    gameModeButtons.classList.remove('hidden');
    gameBoard.classList.add('hidden');
    statusDisplay.classList.add('hidden');
    resetButton.classList.add('hidden');
    newGameButton.classList.add('hidden');
    resetGame();
});

function startGame() {
    gameModeButtons.classList.add('hidden');
    gameBoard.classList.remove('hidden');
    statusDisplay.classList.remove('hidden');
    resetButton.classList.remove('hidden');
    newGameButton.classList.remove('hidden');
    statusDisplay.textContent = `It's ${currentPlayer}'s turn`;
    resetGame();
    cells.forEach(cell => cell.style.pointerEvents = 'auto'); // Enable clicks on cells
}

cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

function handleCellClick(event) {
    const clickedCell = event.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (gameState[clickedCellIndex] !== '' || checkWin()) {
        return;
    }

    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.textContent = currentPlayer;

    if (checkWin()) {
        statusDisplay.textContent = `Player ${currentPlayer} has won!`;
        cells.forEach(cell => cell.style.pointerEvents = 'none');
    } else if (gameState.every(cell => cell !== '')) {
        statusDisplay.textContent = 'Game is a draw!';
    } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        statusDisplay.textContent = `It's ${currentPlayer}'s turn`;

        if (singlePlayerMode && currentPlayer === 'O') {
            cells.forEach(cell => cell.style.pointerEvents = 'none'); // Disable clicks during AI turn
            setTimeout(() => {
                makeAIMove();
                cells.forEach(cell => cell.style.pointerEvents = 'auto'); // Re-enable clicks after AI turn
            }, 2000);
        }
    }
}

function checkWin() {
    return winningConditions.some(condition => {
        return condition.every(index => {
            return gameState[index] === currentPlayer;
        });
    });
}

function resetGame() {
    gameState = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    cells.forEach(cell => {
        cell.textContent = '';
        cell.style.pointerEvents = 'none'; 
    });
    statusDisplay.textContent = `It's ${currentPlayer}'s turn`;
}

function makeAIMove() {
    const bestMove = minimax(gameState, 'O').index;
    gameState[bestMove] = 'O';
    cells[bestMove].textContent = 'O';

    if (checkWin()) {
        statusDisplay.textContent = `Player O has won!`;
        cells.forEach(cell => cell.style.pointerEvents = 'none');
    } else if (gameState.every(cell => cell !== '')) {
        statusDisplay.textContent = 'Game is a draw!';
    } else {
        currentPlayer = 'X';
        statusDisplay.textContent = `It's ${currentPlayer}'s turn`;
    }
}

function minimax(newBoard, player) {
    const availSpots = newBoard
        .map((cell, index) => (cell === '' ? index : null))
        .filter(index => index !== null);

    if (checkWinFor(newBoard, 'X')) {
        return { score: -10 };
    } else if (checkWinFor(newBoard, 'O')) {
        return { score: 10 };
    } else if (availSpots.length === 0) {
        return { score: 0 };
    }

    const moves = [];
    for (let i = 0; i < availSpots.length; i++) {
        const move = {};
        move.index = availSpots[i];
        newBoard[availSpots[i]] = player;

        if (player === 'O') {
            const result = minimax(newBoard, 'X');
            move.score = result.score;
        } else {
            const result = minimax(newBoard, 'O');
            move.score = result.score;
        }

        newBoard[availSpots[i]] = '';
        moves.push(move);
    }

    let bestMove;
    if (player === 'O') {
        let bestScore = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
}

function checkWinFor(board, player) {
    return winningConditions.some(condition => {
        return condition.every(index => {
            return board[index] === player;
        });
    });
}
