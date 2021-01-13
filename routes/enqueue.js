const redis_stack = require("../modules/redis_stack");
const config = require("../config.json");
const supported_types = require("../supported_types");

async function routes(fastify, options) {
  
  /*
   * Push a queue job to the stack
   */
  fastify.post("/enqueue", async (request, response) => {
    // Check if we've exceeded the max. number of jobs
    if (redis_stack.GetQueueSize() > config.max_queue_jobs) {
      return response.status(503).send({ "status": "failure", "message": "Queue full, try again later." });
    }

    const data = await request.file();

    // Check whether the uploaded file is actually supported by ffmpeg - if not, notify the client
    if (!supported_types.includes(data.mimetype)) {
      return response.status(400).send({ "status": "failure", "message": "Unsupported MIME type." });
    }

    let fileMeta = {
      "mime": data.mimetype
    };

    let queuePos = await redis_stack.Push(JSON.stringify(fileMeta));
    return { "status": "success", "meta": fileMeta, "queuePos": queuePos };
  });

  /*
   * Test pop route - pop last item on stack
   */
  fastify.get("/test-pop", async(request, response) => {
    let popped = await redis_stack.Pop();
    return popped;
  });

  /*
   * Get number of jobs on queue
   */
  fastify.get("/enqueue", async (request, response) => {
    let queueSize = await redis_stack.GetQueueSize();
    return response.header("Content-Type", "JSON").send(JSON.stringify({ queueSize }));
  });

  /*
   * Return possible options
   */
  fastify.options("/enqueue", async (request, response) => {
    return response.status(200).header("Allow", "POST, GET").send();
  });
}

module.exports = routes;