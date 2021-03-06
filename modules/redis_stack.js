/*
 * Redis module.
 * Handles local connection to redis
 * 
 * Singleton
 */

const { promisify } = require("util");
const redis = require("redis");
const config = require("../config.json");
const { v4: uuidv4 } = require("uuid");

class Redis {
  constructor() {
    this.app = redis.createClient(config.redis.url);
    this.app.on("error", function(err) {
      console.error(err);
    });

    this._getAsync     = promisify(this.app.get).bind(this.app);
    this._setAsync     = promisify(this.app.set).bind(this.app);
    this._keysAsync    = promisify(this.app.keys).bind(this.app);
    this._rpush        = promisify(this.app.rpush).bind(this.app);
    this._rpop         = promisify(this.app.rpop).bind(this.app);
    this._lpush        = promisify(this.app.lpush).bind(this.app);
    this._lpop         = promisify(this.app.lpop).bind(this.app);
    this._lrange       = promisify(this.app.lrange).bind(this.app);
    this._delAsync     = promisify(this.app.del).bind(this.app);
  }

  async GetQueueSize() {
    var range = await this._lrange(config.redis.queue_name, 0, -1);
    return range.length;
  }

  async Push(value, id) {
    if (!id) {
      // No ID provided - we're probably making a new entry.
      // Generate an ID
      id = uuidv4();
    }

    if (config.redis.log)
      console.log(`Pushing ${id} to queue.`);

    // Push the ID to the queue
    let queuePos = await this._rpush(config.redis.queue_name, id);
    // Create a new key with the ID, give it the value of 'value'.
    await this._setAsync(id, value);

    // Return the ID just in case it was newly generated or something, and the queue pos so we can track this entry later
    return { id, queuePos };
  }

  async Pop() {
    // Popping is a little more complex, since we have two keys to pop
    // We want to pop the ID (step 1) and then return the value of the pair with that key (step 2)

    // Pop id
    var id = await this._lpop(config.redis.queue_name);

    if (config.redis.log)
      console.log(`Popped ${id}.`);

    if (!id) // ID is null, therefore we can't get anything.
      return null;

    // Get pair
    var value = await this._getAsync(id);

    return { id, "value": JSON.parse(value) };
  }

  async GetId(id) {
    // We have an ID, and we want the current status of its value
    if (config.redis.log)
      console.log(`Getting entry ${id}.`);
    
    let kvp = await this._getAsync(id);
    return kvp;
  }

  async SetId(value, id) {
    // We have an ID, and we want to set its value

    if (config.redis.log)
      console.log(`Adding entry ${id}.`);

    // Create a new key with the ID, give it the value of 'value'.
    await this._setAsync(id, value);

    // Return the ID just in case it was newly generated or something
    return { id };
  }

  async DeleteId(id) {
    // Delete pair
    await this._delAsync(id);
  }
}

const instance = new Redis();
Object.freeze(instance);

module.exports = instance;