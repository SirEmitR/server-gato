import net from 'net';

let gameState = {
    board: Array(9).fill(null),
    currentPlayer: 'X',
    winner: null
};

let myTurn = false;

function printBoard() {
    console.log(`
     ${gameState.board[0] || '0'} | ${gameState.board[1] || '1'} | ${gameState.board[2] || '2'}
    ---|---|---
     ${gameState.board[3] || '3'} | ${gameState.board[4] || '4'} | ${gameState.board[5] || '5'}
    ---|---|---
     ${gameState.board[6] || '6'} | ${gameState.board[7] || '7'} | ${gameState.board[8] || '8'}
    `);
}

function makeMove(position) {
    if (gameState.board[position] === null && myTurn && !gameState.winner) {
        gameState.board[position] = gameState.currentPlayer;
        gameState.winner = checkWinner();
        gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
        myTurn = false;
        printBoard();
        if (gameState.winner) {
            console.log(`El ganador es: ${gameState.winner}`);
        }
        sendStateToPeer();
    } else {
        console.log("Movimiento inválido o no es tu turno.");
    }
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
        gameState = JSON.parse(data);
        console.clear();
        printBoard();

        if (gameState.winner) {
            console.log(`El ganador es: ${gameState.winner}`);
        } else {
            console.log("Es tu turno.");
            myTurn = true;
        }
    });
});

server.listen(41200, () => {
    console.log('Esperando conexión del otro jugador en el puerto 41200...');
});

function sendStateToPeer() {
    const client = new net.Socket();
    const peerHost = '192.168.1.2'; 
    const peerPort = 41200; 

    client.connect(peerPort, peerHost, () => {
        client.write(JSON.stringify(gameState));
        client.destroy();
    });
}

process.stdin.on('data', (input) => {
    const position = parseInt(input.toString().trim(), 10);
    if (!isNaN(position) && position >= 0 && position <= 8) {
        makeMove(position);
    } else {
        console.log("Por favor, introduce un número entre 0 y 8.");
    }
});

console.log("Conectando con el otro jugador...");
myTurn = true; 
