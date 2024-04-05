module.exports = {
  app: {
    port: process.env.PORT,
  },
  db: {
    host: process.env.DB_HOST_DEV,
    port: process.env.DB_PORT_DEV,
    name: process.env.DB_NAME_DEV,
  },
};
