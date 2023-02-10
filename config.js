module.exports = {
  mongo: {
    db: process.env.MONGO_URL,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
}
