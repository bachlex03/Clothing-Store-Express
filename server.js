const server = require("./src/app");

const {
  app: { port },
  socket: { port: socketPort },
} = require("./src/config/config.env");

const PORT = port || 3001;

server.listen(PORT, () => {
  console.log(`Server is running in port ${PORT}`);
});
