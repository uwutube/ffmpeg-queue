/*
 * FFmpeg module.
 * Handles ffmpeg process calls, allows for video transcoding
 * 
 * Singleton
 */

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

  /*
   * Invokes ffmpeg process, transcodes video based on profiles specified in config (default profile used in place of
   * missing values, but *not* used if there's no profiles in the config)
   */
  async ProcessVideo(job) {
    console.log("Processing video");

    let completeCount = 0;
    let path = job.value.fileName;
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
  
      if (config.ffmpeg.log) {
        ffmpegProcess.stdout.on("data", function(data) {
          console.log(data);
        });
        
        ffmpegProcess.stderr.setEncoding("utf8");
        ffmpegProcess.stderr.on("data", function(data) {
          console.error(data);
        });
      }
      
      let t = this;
      ffmpegProcess.on("close", function() {
        completeCount++;
        console.log(`Completed ${completeCount} encodes of ${config.ffmpeg.configs.length} for video ${path}`);
        t.SetStatus(job, completeCount / config.ffmpeg.configs.length);
        if (completeCount >= config.ffmpeg.configs.length) {
          console.log(`Finished processing video ${path}`);

          t.SetComplete(job);
          t.Requeue();
        }
      });
    }
  }

  /*
   * Check the current queue status, and process a video if there is one.
   */
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

    // Set job status (beginning to process video)
    await this.SetStatus(currentJob, 0);

    // Process video
    await this.ProcessVideo(currentJob);
  }

  async SetComplete(job) {
    // Job's complete, so we'll create an entry that says it's no longer in progress & the progress is 100%
    await redis.SetId(JSON.stringify(Object.assign({}, job, { "inProgress": false, "progress": 1 })), job.id);
  }

  async SetStatus(job, progress) {
    // Add an entry, but don't push it back onto the stack - we aren't processing this again later.
    // The only point of this entry is to allow us to use the /status/:id endpoint and check the transcoding status.
    await redis.SetId(JSON.stringify(Object.assign({}, job, { "inProgress": true, "progress": progress })), job.id);
  }

  /*
   * Invoke CheckQueue() after an interval specified in the config file.
   */
  Requeue() {
    setTimeout(() => { this.CheckQueue() }, config.ffmpeg.process_interval);
  }
}

const instance = new FFmpeg();
Object.freeze(instance);

module.exports = instance;