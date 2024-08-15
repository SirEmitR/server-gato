import net from 'net';

let gameState = {
    board: Array(9).fill(null),
    currentPlayer: 'X',
    winner: null
};

let myTurn = false;

// Función para imprimir el tablero
function printBoard() {
    console.log(`
     ${gameState.board[0] || ' '} | ${gameState.board[1] || ' '} | ${gameState.board[2] || ' '}
    ---|---|---
     ${gameState.board[3] || ' '} | ${gameState.board[4] || ' '} | ${gameState.board[5] || ' '}
    ---|---|---
     ${gameState.board[6] || ' '} | ${gameState.board[7] || ' '} | ${gameState.board[8] || ' '}
    `);
}

// Función para hacer un movimiento
function makeMove(position) {
    if (gameState.board[position] === null && myTurn && !gameState.winner) {
        gameState.board[position] = gameState.currentPlayer;
        gameState.winner = checkWinner();
        gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
        myTurn = false;

        // Enviar el estado actualizado al otro jugador
        sendStateToPeer();
    } else {
        console.log("Movimiento inválido o no es tu turno.");
    }
}

// Función para verificar si hay un ganador
function checkWinner() {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Filas
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columnas
        [0, 4, 8], [2, 4, 6] // Diagonales
    ];

    for (let combination of winningCombinations) {
        const [a, b, c] = combination;
        if (gameState.board[a] && gameState.board[a] === gameState.board[b] && gameState.board[a] === gameState.board[c]) {
            return gameState.board[a];
        }
    }

    return null;
}

// Crear un servidor TCP para recibir movimientos del otro jugador
const server = net.createServer((socket) => {
    socket.on('data', (data) => {
        gameState = JSON.parse(data);
        printBoard();

        if (gameState.winner) {
            console.log(`El ganador es: ${gameState.winner}`);
            process.exit();
        } else {
            console.log("Es tu turno.");
            myTurn = true;
        }
    });
});

server.listen(41200, () => {
    console.log('Esperando conexión del otro jugador en el puerto 41200...');
});

// Función para enviar el estado del juego al otro jugador
function sendStateToPeer() {
    const client = new net.Socket();
    const peerHost = '162.168.1.2'; // IP del otro nodo (modificar según sea necesario)
    const peerPort = 41200; // Puerto del otro nodo

    client.connect(peerPort, peerHost, () => {
        client.write(JSON.stringify(gameState));
        client.destroy(); // Cerrar conexión
    });
}

// Interacción con el jugador
process.stdin.on('data', (input) => {
    const position = parseInt(input.toString().trim(), 10);
    if (!isNaN(position) && position >= 0 && position <= 8) {
        makeMove(position);
        printBoard();
        if (gameState.winner) {
            console.log(`El ganador es: ${gameState.winner}`);
            process.exit();
        }
    } else {
        console.log("Por favor, introduce un número entre 0 y 8.");
    }
});

console.log("Conectando con el otro jugador...");
myTurn = true; // Este nodo comenzará primero; cambia según sea necesario.
