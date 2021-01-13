const redis = require("../modules/redis");
const supported_types = require("../supported-types");

async function routes(fastify, options) {
  fastify.post("/enqueue", async (request, response) => {
    const data = await request.file();

    if (!supported_types.includes(data.mimetype)) {
      return { "status": "failure", "message": "Unsupported MIME type." };
    }

    let fileMeta = {
      "mime": data.mimetype
    };
    
    await redis.setAsync("queue", JSON.stringify(fileMeta));
    return { "meta": fileMeta, "queuePos": 0 };
  });

  fastify.get("/enqueue", async (request, response) => {
    const data = await redis.getAsync("queue");

    return response.header("Content-Type", "JSON").send(data);
  });

  fastify.options("/enqueue", async (request, response) => {
    return response.status(200).header("Allow", "POST, GET").send();
  });
}

module.exports = routes;