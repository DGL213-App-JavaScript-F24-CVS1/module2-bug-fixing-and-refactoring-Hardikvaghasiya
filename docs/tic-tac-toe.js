"use strict";

(() => {
    window.addEventListener("load", () => {
        // *****************************************************************************
        // #region Constants and Variables

        // Canvas references
        const canvas = document.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        // UI references
        const restartButton = document.querySelector("#restart");
        const undoButton = document.querySelector('#undo');
        const player1ScoreText = document.querySelector('#player1-score');
        const player2ScoreText = document.querySelector('#player2-score');

        // Constants
        const CELLS_PER_AXIS = 3;
        const CELL_WIDTH = canvas.width / CELLS_PER_AXIS;
        const CELL_HEIGHT = canvas.height / CELLS_PER_AXIS;

        // Game variables
        let grids;  // History of game states (stack of grids)
        let currentPlayer = 'X';  // Current player (either 'X' or 'O')
        let gameActive = true;  // Controls whether the game is ongoing
        let winner = null;  // Tracks the winner
        let player1Score = 0;  // Player 1 score (X)
        let player2Score = 0;  // Player 2 score (O)

        // #endregion

        // *****************************************************************************
        // #region Game Logic

        function startGame() {
            grids = [initializeGrid()]; // Initialize a grid with a single state for the undo stack
            currentPlayer = 'X';
            gameActive = true;
            winner = null;
            render(grids[0]);  // Render the initial grid
        }

        function initializeGrid() {
            // Create a 3x3 grid filled with empty strings (indicating no moves yet)
            return Array(CELLS_PER_AXIS).fill(null).map(() => Array(CELLS_PER_AXIS).fill(''));
        }

        function render(grid) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);  // Clear the canvas

            for (let row = 0; row < CELLS_PER_AXIS; row++) {
                for (let col = 0; col < CELLS_PER_AXIS; col++) {
                    // Draw the grid lines
                    ctx.strokeStyle = 'black';
                    ctx.strokeRect(col * CELL_WIDTH, row * CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT);

                    // Draw the player's move
                    if (grid[row][col] !== '') {
                        ctx.font = "60px Arial";
                        ctx.fillStyle = grid[row][col] === 'X' ? 'red' : 'blue';
                        ctx.fillText(grid[row][col], col * CELL_WIDTH + CELL_WIDTH / 4, row * CELL_HEIGHT + CELL_HEIGHT * 3 / 4);
                    }
                }
            }

            // Update the score display
            player1ScoreText.textContent = `Player 1 (X): ${player1Score}`;
            player2ScoreText.textContent = `Player 2 (O): ${player2Score}`;
        }

        function updateGridAt(x, y) {
            if (!gameActive) return;

            const { row, col } = convertCartesiansToGrid(x, y);

            if (grids[grids.length - 1][row][col] === '') {  // Ensure the cell is empty
                const newGrid = grids[grids.length - 1].map(arr => arr.slice());  // Create a copy of the current grid
                newGrid[row][col] = currentPlayer;  // Mark the player's move
                grids.push(newGrid);  // Add the new grid state to history

                render(newGrid);  // Render the updated grid

                if (checkWin(newGrid)) {
                    winner = currentPlayer;
                    alert(`${currentPlayer} wins!`);
                    updateScore();
                    gameActive = false;
                } else if (checkDraw(newGrid)) {
                    alert("It's a draw!");
                    gameActive = false;
                } else {
                    // Switch players
                    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
                }
            }
        }

        function undoLastMove() {
            if (grids.length > 1 && gameActive) {
                grids.pop();  // Remove the last grid from history
                render(grids[grids.length - 1]);  // Render the previous grid
                currentPlayer = currentPlayer === 'X' ? 'O' : 'X';  // Switch players
            }
        }

        function checkWin(grid) {
            // Check rows, columns, and diagonals for a win
            for (let i = 0; i < CELLS_PER_AXIS; i++) {
                if (grid[i][0] === currentPlayer && grid[i][1] === currentPlayer && grid[i][2] === currentPlayer) {
                    return true;
                }
                if (grid[0][i] === currentPlayer && grid[1][i] === currentPlayer && grid[2][i] === currentPlayer) {
                    return true;
                }
            }
            if (grid[0][0] === currentPlayer && grid[1][1] === currentPlayer && grid[2][2] === currentPlayer) {
                return true;
            }
            if (grid[0][2] === currentPlayer && grid[1][1] === currentPlayer && grid[2][0] === currentPlayer) {
                return true;
            }
            return false;
        }

        function checkDraw(grid) {
            // Check if all cells are filled
            return grid.every(row => row.every(cell => cell !== ''));
        }

        function updateScore() {
            if (winner === 'X') {
                player1Score += 1;
            } else if (winner === 'O') {
                player2Score += 1;
            }
        }

        function restartGame() {
            startGame();  // Reset the game
        }

        // #endregion

        // *****************************************************************************
        // #region Event Listeners

        canvas.addEventListener("mousedown", (event) => {
            if (gameActive && !winner) {
                updateGridAt(event.offsetX, event.offsetY);
            }
        });

        restartButton.addEventListener("click", () => {
            restartGame();
        });

        undoButton.addEventListener("click", () => {
            undoLastMove();
        });

        // #endregion

        // #region Helper Functions

        function convertCartesiansToGrid(xPos, yPos) {
            return {
                row: Math.floor(yPos / CELL_HEIGHT),
                col: Math.floor(xPos / CELL_WIDTH)
            };
        }

        // #endregion

        // Start the game
        startGame();
    });
})();
