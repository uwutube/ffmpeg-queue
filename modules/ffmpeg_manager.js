const config = require("../config.json");
const redis = require("./redis_stack");
const { spawn } = require("child_process");

class FFmpeg {
  constructor() { 
    this.CheckQueue();

    // Default profile values - used in place of any values that haven't been set in the config
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
    console.log("Processing video");

    let completeCount = 0;
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
  
      let t = this;
      // TODO: Wait until ffmpeg has completed before moving on
      ffmpegProcess.stdout.on("data", function(data) {
        // console.log(data);
      });
      
      ffmpegProcess.stderr.setEncoding("utf8");
      ffmpegProcess.stderr.on("data", function(data) {
          // console.error(data);
      });
      
      ffmpegProcess.on("close", function() {
        completeCount++;
        console.log(`Completed ${completeCount} encodes of ${config.ffmpeg.configs.length} for video ${path}`);
        if (completeCount >= config.ffmpeg.configs.length) {
          console.log(`Finished processing video ${path}`);
          t.Requeue();
        }
      });
    }
  }

  async CheckQueue() {
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
    await this.ProcessVideo(currentJob.value.fileName);
  }

  Requeue() {
    setTimeout(() => { this.CheckQueue() }, config.ffmpeg.process_interval);
  }
}

const instance = new FFmpeg();
Object.freeze(instance);

module.exports = instance;