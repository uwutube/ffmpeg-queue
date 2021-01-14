const ffmpeg = require("ffmpeg");
const config = require("../config.json");
const redis = require("./redis_stack");
const { spawn } = require("child_process");

class FFmpeg {
  constructor() { 
    this.AssignerLoop();

    // Default values - used in place of any values that haven't been set in the config
    this.defaultProfile = {
      name: "Default",
      size: "1280x720",
      framerate: 60,
      videoCodec: "mpeg4",
      audioCodec: "aac",
      audioChannels: 2,
      bitrate: "2500kb",
      extension: "mp4",
      videoFormat: "mp4"
    }
  }

  async ProcessVideo(path) {
    let process = new ffmpeg(path);

    try {
      // Process video based on specified profiles
      process.then((video) => {
        console.log("Processing video");
        for (let profile of config.ffmpeg.configs) {
          console.log(`Profile ${profile.name}`);

          let args = [
            "-i", path,

            "-b:v", profile.bitrate ?? this.defaultProfile.bitrate,
            "-c:v", profile.videoCodec ?? this.defaultProfile.videoCodec,
            "-c:a", profile.audioCodec ?? this.defaultProfile.audioCodec,
            "-r", profile.framerate ?? this.defaultProfile.framerate,
            "-s", profile.size ?? this.defaultProfile.size,

            "-f", profile.videoFormat ?? this.defaultProfile.videoFormat,
            `${path}_${profile.name ?? this.defaultProfile.name}.${profile.extension ?? this.defaultProfile.extension}`
          ];

          console.log(`ffmpeg ${args}`);

          let ffmpegProcess = spawn("ffmpeg", args);
          ffmpegProcess.stdout.on("data", function(data) {
              console.log(data);
          });
          
          ffmpegProcess.stderr.setEncoding("utf8")
          ffmpegProcess.stderr.on("data", function(data) {
              console.log(data);
          });
          
          ffmpegProcess.on("close", function() {
              console.log("Done");
          });
        }
      }).catch((err) => {
        console.error(err);
      })
    } catch {}
  }

  async AssignerLoop() {
    // This is just a separate loop in which this ffmpeg worker will assign itself to any open jobs and process a file in
    // the queue.
    // It's called from the constructor, and then just recursively calls itself until the end of time

    if (await redis.GetQueueSize() <= 0) {
      // No jobs to complete
      return this.Requeue();
    }

    // Get next job
    let currentJob = await redis.Pop();

    // Push back onto the stack - in progress
    // await redis.Push(JSON.stringify(Object.assign({}, currentJob, { "inProgress": true })));

    // Process video
    console.log(currentJob);
    await this.ProcessVideo(currentJob.value.fileName);

    return this.Requeue();
  }

  Requeue() {
    setTimeout(() => { this.AssignerLoop() }, config.ffmpeg.process_interval);
  }
}

const instance = new FFmpeg();
Object.freeze(instance);

module.exports = instance;