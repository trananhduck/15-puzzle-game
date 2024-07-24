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
let isPuzzleSolvedState = true;

// Tạo câu đố
function initBoard() {
    const savedState = JSON.parse(localStorage.getItem('gameState'));
    if (savedState) {
        tiles = savedState.tiles;
        moveCount = savedState.moveCount;
        elapsedTime = savedState.elapsedTime;
        isPuzzleSolvedState = savedState.isPuzzleSolvedState;
    } else {
        tiles = generateSolvablePuzzle();
    }
    
    renderBoard();
    if (!savedState) {
        clearInterval(timerInterval);
        elapsedTime = 0;
        timeDisplay.textContent = '00:00';
        resetTimer(); // Start the timer if there is no saved state
    } else {
        timerInterval = setInterval(updateTime, 1000);
    }
    updateHighScore();
    toggleShuffleInfo(isPuzzleSolvedState); // Update shuffle info visibility
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
            saveGameState();
            if (isPuzzleSolved()) {
                handleWin();
            }
        }
    }
}

function shuffleBoard() {
    if (isPuzzleSolvedState) {
        tiles = generateSolvablePuzzle();

        moveCount = 0;
        resetTimer();  // reset time khi shuffle
        renderBoard();
        toggleShuffleInfo(false); // Ẩn thông báo shuffle
        congratulations.classList.add('hidden'); // Ẩn thông báo chiến thắng
        isPuzzleSolvedState = false;
        saveGameState();
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

    // Đảm bảo trạng thái có thể giải đc
    const index14 = tiles.indexOf(14);
    const index15 = tiles.indexOf(15);

    // CHECK xem 14 có trước 15 ko
    return index14 < index15;
}

function handleWin() {
    clearInterval(timerInterval);
    congratulations.classList.remove('hidden');
    const score = 1000 - moveCount;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        updateHighScore();
    }
    isPuzzleSolvedState = true;
    toggleShuffleInfo(true); // Hiển thị thông báo shuffle
    saveGameState();
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

function saveGameState() {
    const gameState = {
        tiles,
        moveCount,
        elapsedTime,
        isPuzzleSolvedState
    };
    localStorage.setItem('gameState', JSON.stringify(gameState));
}

function isSolvable(puzzle) {
    const oneDArray = puzzle.filter(n => n !== null); // Xóa tile trống
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
        puzzle = Array.from({ length: 15 }, (_, i) => i + 1).concat(null); // Đảm bảo có lời giải
        // Xáo trộn câu đố
        for (let i = puzzle.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [puzzle[i], puzzle[j]] = [puzzle[j], puzzle[i]];
        }
    } while (!isSolvable(puzzle)); // Kiểm tra xem câu đố có giải được không

    return puzzle;
}


shuffleButton.addEventListener('click', shuffleBoard);

initBoard();
