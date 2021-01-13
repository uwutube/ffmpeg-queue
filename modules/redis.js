/*
 * Redis module.
 * Handles local connection to redis
 * 
 * Singleton
 */

var { promisify } = require("util");
var redis = require("redis");

class Redis {
  constructor() {
    this.app = redis.createClient("redis://redis");
    this.app.on("error", function(err) {
      console.error(err);
    });

    this.getAsync = promisify(this.app.get).bind(this.app);
    this.setAsync = promisify(this.app.set).bind(this.app);
    this.keysAsync = promisify(this.app.keys).bind(this.app);
  }
}

const instance = new Redis();
Object.freeze(instance);

module.exports = instance;