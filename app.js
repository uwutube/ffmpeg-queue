const config = require("./config.json");
const fastify = require("fastify")({
  logger: true
});

fastify.register(require("fastify-multipart"), { 
  fileSize: config.max_file_size,
  files: config.max_files
});

fastify.register(require("./routes/enqueue"));
fastify.register(require("./routes/status"));

fastify.listen(3000, "0.0.0.0", function (err, address) {
  if (err) {
      fastify.log.error(err);
      process.exit(1);
  }
  fastify.log.info(`Server listening on ${address}`);
});