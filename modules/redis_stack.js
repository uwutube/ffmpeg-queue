/*
 * Redis module.
 * Handles local connection to redis
 * 
 * Singleton
 */

var { promisify } = require("util");
var redis = require("redis");
const config = require("../config.json");

class Redis {
  constructor() {
    this.app = redis.createClient("redis://redis");
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
  }

  async GetQueueSize() {
    var range = await this._lrange(config.queue_name, 0, -1);
    return range.length;
  }

  async Push(value) {
    var queuePos = await this._rpush(config.queue_name, value);
    return queuePos;
  }

  async Pop() {
    var value = await this._lpop(config.queue_name);
    return value;
  }
}

const instance = new Redis();
Object.freeze(instance);

module.exports = instance;