const { rooms } = require('./roomService');

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('createRoom', (roomCode) => {
      socket.join(roomCode);
      rooms[roomCode].creator = socket.id; // Almacenar el ID del creador
      socket.emit('roomCreated', { roomCode, creator: socket.id });
      console.log(`Room created: ${roomCode} by ${socket.id}`);
    });

    socket.on('joinRoom', (roomCode) => {
      socket.join(roomCode);
      console.log(`User ${socket.id} joined room: ${roomCode}`);
      const roomState = rooms[roomCode];
      if (roomState) {
        socket.emit('initializeBoard', roomState);
        socket.emit('roomDetails', { creator: roomState.creator }); // Enviar detalles de la sala
        console.log(`Room details sent: ${JSON.stringify({ creator: roomState.creator })}`);
      }
    });

    socket.on('updateCardState', (roomCode, cardId, newState) => {
      const roomState = rooms[roomCode];
      if (roomState) {
        const card = roomState.cards.find(card => card.id === cardId);
        if (card) {
          card.revealed = newState;
        }
        io.to(roomCode).emit('cardStateUpdated', cardId, newState);
        // Emitir también al cliente que hizo el cambio para asegurarse de que el estado local se actualice correctamente
        socket.emit('cardStateUpdated', cardId, newState);
      }
    });

    socket.on('replaceCardState', (roomCode, cardId, newCard) => {
      const roomState = rooms[roomCode];
      if (roomState) {
        const cardIndex = roomState.cards.findIndex(card => card.id === cardId);
        if (cardIndex !== -1) {
          roomState.cards[cardIndex] = newCard;
        }
        io.to(roomCode).emit('cardReplaced', cardId, newCard);
        // Emitir también al cliente que hizo el cambio para asegurarse de que el estado local se actualice correctamente
        socket.emit('cardReplaced', cardId, newCard);
      }
    });

    socket.on('initializeBoard', (roomCode, cards, selectedTeam) => {
      rooms[roomCode] = { ...rooms[roomCode], cards, selectedTeam };
      io.to(roomCode).emit('initializeBoard', rooms[roomCode]);
    });

    socket.on('toggleLock', (roomCode, lockState) => {
      const roomState = rooms[roomCode];
      if (roomState) {
        roomState.locked = lockState;
        io.to(roomCode).emit('lockStateUpdated', lockState);
      }
    });

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });
};

module.exports = setupSocket;
