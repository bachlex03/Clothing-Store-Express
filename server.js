const app = require("./src/app");

const {
  app: { port },
} = require("./src/config/config.env");

const PORT = port || 3050;

app.listen(PORT, () => {
  console.log(`Server is running in port ${PORT}`);
});
