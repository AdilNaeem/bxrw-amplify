  export function videoTimeToFrameCount(time, fps) {
    return Math.round(time * fps);
  }

  export function frameCountToVideoTime(numFrames, fps) {
    return numFrames/ fps;
  }


  // Generate the components of a hh:mm:ss:ff timecode
  // Note. doesn't deal with `weird` frame-rates like 
  //       29.97 that require drop-frames for correct
  //       calculation. 
  //       See https://sonix.ai/resources/what-is-drop-frame-vs-non-drop-frame-timecode/
  export function timeCodeFromFrameCount(frameCount, fps) {
    let totalSecs = Math.floor(frameCount / fps); 
    let ff = frameCount - totalSecs * fps;
    let ss = totalSecs % 60;
    let totalMinutes = Math.floor(totalSecs / 60);
    let mm = totalMinutes % 60; 
    let hh = Math.floor(totalMinutes / 60);
    return {'hh': hh, 'mm': mm, 'ss': ss, 'ff': ff};
  }