import net from 'net';
let gameState = {
    board: Array(9).fill(null),
    currentPlayer: 'X',
    winner: null
};

function makeMove(position) {
    if (gameState.board[position] === null && !gameState.winner) {
        gameState.board[position] = gameState.currentPlayer;
        gameState.winner = checkWinner();
        gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
    }
    return gameState;
}

function checkWinner() {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (let combination of winningCombinations) {
        const [a, b, c] = combination;
        if (gameState.board[a] && gameState.board[a] === gameState.board[b] && gameState.board[a] === gameState.board[c]) {
            return gameState.board[a];
        }
    }
    return null;
}

const server = net.createServer((socket) => {
    socket.on('data', (data) => {
        const { method, params } = JSON.parse(data);
        let result;

        if (method === 'makeMove') {
            result = makeMove(...params);
        }

        socket.write(JSON.stringify({ result }));
    });
});

server.listen(8000, () => {
    console.log('Servidor RPC escuchando en el puerto 8000');
});