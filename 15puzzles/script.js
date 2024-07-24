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

// Khởi tạo bảng câu đố
function initBoard() {
    const savedState = JSON.parse(localStorage.getItem('gameState'));
    if (savedState) {
        tiles = savedState.tiles;
        moveCount = savedState.moveCount;
        elapsedTime = savedState.elapsedTime;
        isPuzzleSolvedState = savedState.isPuzzleSolvedState;
    } else {
        tiles = generateSolvablePuzzle();
        isPuzzleSolvedState = true; // Bắt đầu ở trạng thái đã giải quyết để hiện thông báo shuffle
        toggleShuffleInfo(true); // Hiển thị thông báo shuffle khi truy cập game
    }

    renderBoard();
    if (!savedState) {
        clearInterval(timerInterval);
        elapsedTime = 0;
        timeDisplay.textContent = '00:00';
    } else {
        timerInterval = setInterval(updateTime, 1000);
    }
    updateHighScore();
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

        // Kiểm tra xem ô trống có kề bên ô cần di chuyển không
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
    tiles = generateSolvablePuzzle();
    moveCount = 0;
    resetTimer(); // Đặt lại thời gian khi xáo trộn
    renderBoard();
    toggleShuffleInfo(false); // Ẩn thông báo shuffle sau khi xáo trộn
    congratulations.classList.add('hidden'); // Ẩn thông báo chiến thắng
    isPuzzleSolvedState = false;
    saveGameState();
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

    // Kiểm tra vị trí của ô 14 và 15 ở cuối cùng
    const index14 = tiles.indexOf(14);
    const index15 = tiles.indexOf(15);

    // Đảm bảo rằng 14 đứng trước 15
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
    toggleShuffleInfo(true); // Hiển thị thông báo shuffle sau khi thắng
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
    const oneDArray = puzzle.filter(n => n !== null); // Xóa ô trống
    let inversions = 0;

    for (let i = 0; i < oneDArray.length - 1; i++) {
        for (let j = i + 1; j < oneDArray.length; j++) {
            if (oneDArray[i] > oneDArray[j]) {
                inversions++;
            }
        }
    }

    // Tìm hàng của ô trống từ dưới lên (đếm từ 1)
    const emptyRowFromBottom = 4 - Math.floor(puzzle.indexOf(null) / 4);

    // Kiểm tra xem câu đố có giải được không
    return (inversions % 2 === 0 && emptyRowFromBottom % 2 !== 0) ||
           (inversions % 2 !== 0 && emptyRowFromBottom % 2 === 0);
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
