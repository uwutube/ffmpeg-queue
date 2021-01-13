const fastify = require('fastify')({
  logger: true
});

fastify.register(require("fastify-multipart"));
fastify.register(require("./routes/enqueue"));
fastify.register(require("./routes/status"));

fastify.listen(3000, "0.0.0.0", function (err, address) {
  if (err) {
      fastify.log.error(err);
      process.exit(1);
  }
  fastify.log.info(`server listening on ${address}`);
});