const board = document.getElementById('puzzle-board');
const shuffleButton = document.getElementById('shuffle-button');
const movesDisplay = document.getElementById('moves');
const timeDisplay = document.getElementById('time');
const highScoreDisplay = document.getElementById('high-score');
const congratulations = document.getElementById('congratulations');
const shuffleInfo = document.getElementById('shuffle-info');

let tiles = [];
let moveCount = 0;
let timerInterval;
let elapsedTime = 0;
let highScore = localStorage.getItem('highScore') || 0;
let isPuzzleSolvedState = true; // New variable to track if the puzzle is solved or not

// Create and initialize the puzzle board
function initBoard() {
    tiles = generateSolvablePuzzle(); // Generate a solvable puzzle
    renderBoard();
    clearInterval(timerInterval);
    elapsedTime = 0;
    timeDisplay.textContent = '00:00';
    updateHighScore();
    toggleShuffleInfo(true); // Show the shuffle info initially
}

function renderBoard() {
    board.innerHTML = '';
    tiles.forEach((tile, index) => {
        const tileElement = document.createElement('div');
        tileElement.className = 'tile' + (tile === null ? ' empty' : '');
        tileElement.textContent = tile ? tile : '';
        tileElement.addEventListener('click', () => moveTile(index));
        board.appendChild(tileElement);
    });
    movesDisplay.textContent = moveCount;
}

function moveTile(index) {
    if (!isPuzzleSolvedState) {
        const emptyIndex = tiles.indexOf(null);
        const [row, col] = [Math.floor(index / 4), index % 4];
        const [emptyRow, emptyCol] = [Math.floor(emptyIndex / 4), emptyIndex % 4];

        if (
            (row === emptyRow && Math.abs(col - emptyCol) === 1) ||
            (col === emptyCol && Math.abs(row - emptyRow) === 1)
        ) {
            [tiles[index], tiles[emptyIndex]] = [tiles[emptyIndex], tiles[index]];
            moveCount++;
            renderBoard();
            if (isPuzzleSolved()) {
                handleWin();
            }
        }
    }
}

function shuffleBoard() {
    if (isPuzzleSolvedState) {
        tiles = generateSolvablePuzzle(); // Generate a solvable puzzle

        moveCount = 0;
        resetTimer();  // Reset the timer when shuffling
        renderBoard();
        toggleShuffleInfo(false); // Hide shuffle info after shuffling
        congratulations.classList.add('hidden'); // Hide congratulations message
        isPuzzleSolvedState = false; // Mark puzzle as not solved
    }
}

function resetTimer() {
    clearInterval(timerInterval);
    elapsedTime = 0;
    timeDisplay.textContent = '00:00';
    timerInterval = setInterval(updateTime, 1000);
}

function isPuzzleSolved() {
    const isSolved = tiles.slice(0, -1).every((tile, index) => tile === index + 1);
    if (!isSolved) {
        return false;
    }

    // Ensure the puzzle is in a valid solved state
    const index14 = tiles.indexOf(14);
    const index15 = tiles.indexOf(15);
    
    // Check if 14 is before 15 in a solved state
    return index14 < index15;
}

function handleWin() {
    clearInterval(timerInterval);
    congratulations.classList.remove('hidden');
    const score = 1000 - moveCount; // Calculate score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        updateHighScore();
    }
    isPuzzleSolvedState = true; // Mark puzzle as solved
    toggleShuffleInfo(true); // Show shuffle info after solving
}

function updateHighScore() {
    highScoreDisplay.textContent = highScore;
}

function updateTime() {
    elapsedTime++;
    const minutes = String(Math.floor(elapsedTime / 60)).padStart(2, '0');
    const seconds = String(elapsedTime % 60).padStart(2, '0');
    timeDisplay.textContent = `${minutes}:${seconds}`;
}

function toggleShuffleInfo(show) {
    shuffleInfo.classList.toggle('hidden', !show);
}

function isSolvable(puzzle) {
    const oneDArray = puzzle.filter(n => n !== null); // Remove the empty tile
    let inversions = 0;

    for (let i = 0; i < oneDArray.length - 1; i++) {
        for (let j = i + 1; j < oneDArray.length; j++) {
            if (oneDArray[i] > oneDArray[j]) {
                inversions++;
            }
        }
    }

    return inversions % 2 === 0;
}

function generateSolvablePuzzle() {
    let puzzle;
    do {
        puzzle = Array.from({ length: 15 }, (_, i) => i + 1).concat(null); // Create a solvable array with the empty tile
        for (let i = puzzle.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [puzzle[i], puzzle[j]] = [puzzle[j], puzzle[i]];
        }
    } while (!isSolvable(puzzle));

    return puzzle;
}

shuffleButton.addEventListener('click', shuffleBoard);

initBoard();
