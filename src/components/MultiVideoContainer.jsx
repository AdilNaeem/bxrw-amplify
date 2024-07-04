import React, { useEffect, useRef, useState } from 'react';
import { IoMdRewind, IoMdSkipBackward, IoMdSkipForward, IoMdFastforward, IoMdPlay, IoMdPause } from "react-icons/io";
import './MultiVideoContainer.css';
import { TimeEntry } from './TimeEntry';
import useKeyboardShortcut from 'use-keyboard-shortcut';
import { videoTimeToFrameCount, frameCountToVideoTime, timeCodeFromFrameCount } from '../lib/time';
import { makeCamButtons, makeVideoSpeedButton } from '../lib/multivideo';

const ZOOMING_STATES = ['unzoomed', 'rect-capture', 'zoomed'];

const unzoomedRect = {left: 0, top: 0, right: 768, bottom: 432};
const initialRect = {'left': -9999, 'top': -9999, 'right': 0, 'bottom': 0};

const MultiVideoContainer = ( 
  {
    urls, 
    fps, 
    timeCode, 
    cbTimeCode, 
    isPlaying, 
    setIsPlaying, 
    additionalButtonInfo, 
    videoRef,
    zoomData } ) => {
  
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [URL, setURL] = useState(urls[0]);
  const [zoomState, setZoomState] = useState('unzoomed');
  const [zoom, setZoom] = useState(unzoomedRect);
  const [zoomRect, setZoomRect] = useState(initialRect);
  const [showTimeEntry, setShowTimeEntry] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(0); // 0 = full speed, 1 = half speed
  const [isEnded, setIsEnded] = useState(false); // Has the video ended

  useEffect(() => {
    const video = videoRef.current;
    const handleEnded = () => {
      setIsPlaying(false);
      setIsEnded(true);
      step(0); // force the frame count to update
    };
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('ended', handleEnded);
    };
  }, []);
  

  // Keyboard short-cuts START
  const defaultKbShortcutOptions = { 
    overrideSystem: false,
    ignoreInputFields: false, 
    repeatOnHold: false 
  };
  useKeyboardShortcut(
      ["Shift", "ArrowLeft"],
      shortcutKeys => {
        if (!isPlaying) {
          setIsEnded(false);
          step(-10);
        }
      },
      defaultKbShortcutOptions
  );
  useKeyboardShortcut(
      ["Shift", "ArrowRight"],
      shortcutKeys => {
        if (!isPlaying) step(10);
      },
      defaultKbShortcutOptions
  );
  useKeyboardShortcut(
      ["ArrowLeft"],
      shortcutKeys => {
        if (!isPlaying) {
          setIsEnded(false);
          step(-1);
        }
      },
      {defaultKbShortcutOptions, repeatOnHold: true}
  );
  useKeyboardShortcut(
      ["ArrowRight"],
      shortcutKeys => {
        if (!isPlaying) step(1);
      },
      {defaultKbShortcutOptions, repeatOnHold: true}
  );
  useKeyboardShortcut(
      [" "],
      shortcutKeys => {
          togglePlay();
      },
      defaultKbShortcutOptions
  );
  useKeyboardShortcut(
      ["t"],
      shortcutKeys => {
          setShowTimeEntry(!showTimeEntry);
      },
      defaultKbShortcutOptions
  );
  // Keyboard short-cuts END

  const toggleZooming = (event) => {
    const buttonLabel = event.target.innerHTML;
    if (buttonLabel === 'Zoom') {
        setZoomState('rect-capture');
    } else {
        setZoom(unzoomedRect);
        setZoomState('unzoomed');
    };
  }

  const startDrawing = ({ nativeEvent }) => {
    if (zoomState === 'rect-capture') {
      const { offsetX, offsetY } = nativeEvent;
      setZoomRect({ left: offsetX, top: offsetY, right: offsetX, bottom: offsetY });

      contextRef.current.beginPath();
      contextRef.current.strokeStyle = 'red';
    }
  };

  const draw = ({ nativeEvent }) => {
    if (zoomState !== 'rect-capture') return;
    if (zoomRect === initialRect) return;
    const { offsetX, offsetY } = nativeEvent;
    const width = offsetX - zoomRect.left;
    const height = offsetY - zoomRect.top;
    
    contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    contextRef.current.strokeRect(zoomRect.left, zoomRect.top, width, height);
  };

  const finishDrawing = ({ nativeEvent}) => {
    if (zoomState === 'rect-capture') {
      const {offsetX, offsetY } = nativeEvent;
      let updatedZoomRect = {...zoomRect, right: offsetX, bottom: offsetY};
      
      setZoom(updatedZoomRect);
      setZoomRect( initialRect );
      setZoomState('zoomed');
      let fn = videoTimeToFrameCount(videoRef.current.currentTime, fps)
      //let camId = urls.indexOf(videoRef.current.src);
      zoomData.addRect(updatedZoomRect, fn);

      contextRef.current.closePath();
      contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const setupCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 768;
      canvas.height = 432;
      canvas.style.width = `${768}px`;
      canvas.style.height = `${432}px`;
      const context = canvas.getContext('2d');
      contextRef.current = context;
    }
  };

  useEffect(() => {
    setupCanvas();
  }, []); // Empty dependency array ensures this runs only once on mount

  function rectToTransform(rect) {
    let left, top, bottom, right;
    ({left, top, bottom, right} = rect);
    let scaleX = (768 / (right - left)).toFixed(2);
    let scaleY = (432 / (bottom - top)).toFixed(2);
    let offsetX = -left;
    let offsetY = -top;
    let transformStr = `scale(${scaleX}, ${scaleY}) translate(${offsetX}px, ${offsetY}px)`;
    return transformStr
  }

  const togglePlay = () => {
    if (isPlaying) {
        videoRef.current.pause();
        let num_frames = videoTimeToFrameCount(videoRef.current.currentTime, fps);
        videoRef.current.currentTime = frameCountToVideoTime(num_frames, fps);
        cbTimeCode(videoRef.current.currentTime);
    } else {
        videoRef.current.play();
    }
    if (videoRef.current && videoRef.current.currentTime < videoRef.current.duration) {
      setIsEnded(false);
    }
    setIsPlaying(!isPlaying);
  };

  const stepForward = () => {
    step(1);
  }

  const stepForwardMulti = () => {
    step(10);
  }

  const stepBack = () => {
    setIsEnded(false);
    step(-1);
  }

  const stepBackMulti = () => {
    setIsEnded(false);
    step(-10);
  }

  function step(framesToStep) {
    let num_frames = videoTimeToFrameCount(videoRef.current.currentTime, fps);
    num_frames += framesToStep;
    videoRef.current.currentTime = frameCountToVideoTime(num_frames, fps);
    cbTimeCode(videoRef.current.currentTime);
  }

  function gotoTime(time) {
    videoRef.current.currentTime = time;
    cbTimeCode(videoRef.current.currentTime);
  }

  function changeTimeEntry(time) {
    gotoTime(time);
    setShowTimeEntry(false);
  }

  function changeURL(event, url) {
    let num_frames = videoTimeToFrameCount(videoRef.current.currentTime, fps);
    videoRef.current.src = url;
    videoRef.current.currentTime = frameCountToVideoTime(num_frames, fps);
    videoRef.current.playbackRate = playbackSpeed === 0 ? 1.0 : 0.5;
    cbTimeCode(videoRef.current.currentTime);
    setURL(url);
  }

  const videoPlayerDefaultButtonStyle = {
    color: "white", 
    fontSize: "1em", 
    background: "black", 
    verticalAlign: 'middle',
    margin: "0px 2px 0px 2px",
    padding: "2px 5px 2px 5px",
    borderRadius: "4px",
    height: "30px"
  };

  const videoPlayerButtonWithDisabledStyle =  isPlaying ? { 
      ...videoPlayerDefaultButtonStyle, 
      color: "gray",
  } : {
      ...videoPlayerDefaultButtonStyle,
      color: "white", 
  };

  function updateVideoSpeed(event, index) {
    videoRef.current.playbackRate = index === 0 ? 1.0 : 0.5; 
    setPlaybackSpeed(index);
  }

  const videoButtonsStyle = {
    margin: "0px 2px 0px 2px",
    fontSize: "13px"
  }

  const camButtons = makeCamButtons(urls, URL, changeURL, isPlaying);
  const speedButtons = makeVideoSpeedButton(playbackSpeed, updateVideoSpeed);
  const videoPlayerControls =  (
  <span className='video-player-buttons'>
    <button disabled={isPlaying} style={videoPlayerButtonWithDisabledStyle} onClick={stepBackMulti}><IoMdRewind /></button>    
    <button disabled={isPlaying} style={videoPlayerButtonWithDisabledStyle} onClick={stepBack}><IoMdSkipBackward /></button>
    <button 
        style={videoPlayerDefaultButtonStyle} onClick={togglePlay}>{isPlaying ? (<IoMdPause />) : (<IoMdPlay />)}
    </button>
    <button disabled={isPlaying} style={videoPlayerButtonWithDisabledStyle} onClick={stepForward}><IoMdSkipForward /></button>
    <button disabled={isPlaying} style={videoPlayerButtonWithDisabledStyle} onClick={stepForwardMulti}><IoMdFastforward /></button>
  </span>);
  const additionalButtons = additionalButtonInfo.map((info, index) => 
        <button
            key={`punch-button-${index}`}
            onClick={info.behaviour}
            disabled={info.disabled}
            style={videoButtonsStyle}
        >
            {info.name}
            </button>
    );

  function displayTime(time, fps) {
      /* Display time in hh:mm:ss.cs where cs is centiseconds */
      let frameCount = videoTimeToFrameCount(time, fps);
      let timeCode = timeCodeFromFrameCount(frameCount, fps);
      let { hh, mm, ss, ff } = timeCode;
      hh = hh.toString().padStart(2, 0);
      mm = mm.toString().padStart(2, 0);
      ss = ss.toString().padStart(2, 0);
      let cs = (Math.round(ff*100/fps, 2)).toString().padStart(2, 0);
      return `Time: ${hh}:${mm}:${ss}.${cs}`;
  }

  function displayFrameCount(time, fps, duration) {
    let totalFrameCount = videoTimeToFrameCount(duration, fps);
    let frameCount = videoTimeToFrameCount(time, fps);
    let timeCode = timeCodeFromFrameCount(frameCount, fps);
    let frameCountDisplay = String(frameCount).padStart(4, '0');
    let totalFrameCountDisplay = String(totalFrameCount).padStart(4, '0');
    return `Frame: ${frameCountDisplay}/${totalFrameCountDisplay}`;
}


const duration = videoRef.current && !Number.isNaN(videoRef.current.duration) ? videoRef.current.duration : 0;

  return (
    <>
    <div className='cam-button-container'>
      <div className='cam-buttons-left'>
        {camButtons}
      </div>
      <div className='cam-buttons-right'>
      <span id='frame-count-display' 
        className={isEnded ? "video-info-round-finished" : "video-info-round"}>
          {displayFrameCount(timeCode, fps, duration)}</span>
      {speedButtons}
      </div>
    </div>
    <div className="MultiVideoContainer">
      <div className="video-container">
        <video
            ref={videoRef}
            width="768"
            height="432"
            style={ {transform: rectToTransform(zoom)} }
            src={urls[0]}
        />
      <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseUp={finishDrawing}
          onMouseMove={draw}
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0,
            pointerEvents: zoomState === 'rect-capture' ? 'auto' : 'none'
          }}
        />
        </div>
      </div>
      <div>
      {showTimeEntry ? <TimeEntry changeTimeEntry={changeTimeEntry} /> : null}
      <div className='video-button-bar'>
        <span id='time-display' className='video-info-round'>{displayTime(timeCode, fps)}</span>
        {videoPlayerControls}
        <span className='video-buttons'>
          <button disabled={isPlaying} style={videoButtonsStyle} onClick={toggleZooming}>{zoomState === 'unzoomed' ? 'Zoom' : 'Unzoom'}</button>
          {additionalButtons}
        </span>
      </div>
      </div>
    </>
  );
};

export default MultiVideoContainer;