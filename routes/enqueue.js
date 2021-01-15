const redis_stack = require("../modules/redis_stack");
const config = require("../config.json");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

async function routes(fastify, options) {
  /*
   * Push a queue job to the stack
   */
  fastify.post("/enqueue", async (request, response) => {
    // Check if we've exceeded the max. number of jobs in the queue
    if (redis_stack.GetQueueSize() > config.upload.max_queue_jobs) {
      return response.status(503).send({ "status": "failure", "message": "Queue full, try again later." });
    }

    const file = await request.file();
    const data = await file.toBuffer();

    // Check whether the uploaded file is actually supported by ffmpeg - if not, notify the client
    if (!config.upload.supported_types.includes(file.mimetype)) {
      return response.status(400).send({ "status": "failure", "message": "Unsupported MIME type." });
    }
    
    // Get random temporary file name
    let fileName = `/tmp/${uuidv4()}`;

    // Write file contents
    fs.writeFile(fileName, data, (err) => {
      if (err)
        return console.error(err);

      console.log(`Saved file ${fileName}`);
    });
    
    // File metadata - used to track the file and the time it was created, allows ffmpeg to assign itself rather than
    // having to assign it manually each time
    let fileMeta = {
      fileName,
      time: new Date()
    };

    // Push the data itself to redis. This function handles all of the backend stuff - like creating a separate key 
    // for the data - rather than having to do it here
    let queuePos = await redis_stack.Push(JSON.stringify(fileMeta));

    // Send data back to client
    return { "status": "success", "file": fileMeta, "stack": queuePos };
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