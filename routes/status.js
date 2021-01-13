const redis_stack = require("../modules/redis_stack");
const config = require("../config.json");

async function routes(fastify, options) {
  /*
   * Get the status of a queued job
   */
  fastify.get("/status/:id", async (request, response) => {
    let pair = await redis_stack.GetId(request.params.id);
    return pair;
  });
}

module.exports = routes;