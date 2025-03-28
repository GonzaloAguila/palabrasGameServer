const generateRoomCode = () => {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
  };
  
  const rooms = {};
  
  const createRoom = (req, res) => {
    const { socketId } = req.body;
    const roomCode = generateRoomCode();
    rooms[roomCode] = {
      cards: [],
      selectedTeam: null,
      creator: socketId, // Almacenar el ID del creador
    };
    res.json({ roomCode });
  };
  
  const joinRoom = (req, res) => {
    const { roomCode, socketId } = req.body; // Asegúrate de que el ID del socket se pase en el cuerpo de la solicitud
    const room = rooms[roomCode];
    if (room) {
      // Si es la primera vez que se une alguien, almacenamos el ID del creador
      if (!room.creator) {
        room.creator = socketId;
      }
      res.json({ success: true, state: room });
    } else {
      res.json({ success: false });
    }
  };
  
  module.exports = {
    createRoom,
    joinRoom,
    rooms,
  };
  