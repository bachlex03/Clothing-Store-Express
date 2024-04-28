module.exports = {
  app: {
    port: process.env.PORT,
  },
  socket: {
    port: process.env.SOCKET_PORT,
  },
  db: {
    host: process.env.DB_HOST_DEV,
    port: process.env.DB_PORT_DEV,
    name: process.env.DB_NAME_DEV,
  },
  jwt: {
    secretKey: process.env.JWT_SECRET,
    accessTokenExpiration: process.env.AT_EXPIRED_IN,
    refreshTokenExpiration: process.env.RT_EXPIRED_IN,
  },
  mailer: {
    sender: process.env.MAILER_SENDER,
    password: process.env.MAILER_PASSWORD,
    tokenExpiration: process.env.MAILER_TOKEN_EXPIRED_IN,
  },
  website: {
    url: process.env.REACT_URL,
  },
  vnpay: {
    tmnCode: process.env.VN_PAY_TMN_CODE,
    hashSecret: process.env.VN_PAY_HASH_SECRET,
    vnpUrl: process.env.VN_PAY_URL_PAYMENT,
  },
};
