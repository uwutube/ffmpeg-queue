const config = require("./config.json");
const ffmpeg = require("./modules/ffmpeg_manager");
const fastify = require("fastify")({
  logger: true
});

fastify.register(require("fastify-multipart"), { 
  fileSize: config.upload.max_file_size,
  files: config.upload.max_files
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