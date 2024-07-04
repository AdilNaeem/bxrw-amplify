import React, { useEffect, useRef, useState } from 'react';
import './PunchExceptionScreen.css';
import { ScrollView } from '@aws-amplify/ui-react';
import MultiVideoContainer from './MultiVideoContainer';
import ExceptionInfoPane from './ExceptionInfoPane';
import { videoTimeToFrameCount, frameCountToVideoTime } from '../lib/time';
import { exceptionSummary } from '../lib/exception';
import { makeCamButtons } from '../lib/multivideo';

const unzoomedRect = {left: 0, top: 0, right: 640, bottom: 360};
const initialRect = {'left': -9999, 'top': -9999, 'right': 0, 'bottom': 0};
const emptyException = {'exceptionType': 'EMPTY', 'startTime': 0.0};
 
const PunchExceptionScreen = ({selectedDataSource, exitScreen}) => {
    const {source_urls, ...header_info} = selectedDataSource;
    const { fps } = header_info;


    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    
    const [timeCode, setTimeCode] = useState(0.0);
    const [URL, setURL] = useState("");
    const [isPlaying, setIsPlaying] = useState(false);
    const [zoomState, setZoomState] = useState('unzoomed');
    const [zoom, setZoom] = useState(unzoomedRect);
    const [zoomRect, setZoomRect] = useState(initialRect);
    const [currentException, setCurrentException] = useState(emptyException);
    const [jsonExceptions, setJsonExceptions] = useState([]);

    const handleChange = e => {
        const fileReader = new FileReader();
        fileReader.readAsText(e.target.files[0], "UTF-8");
        fileReader.onload = e => {
            const parsedJson= parseJsonFile(e.target.result);
            setJsonExceptions(parsedJson);
            if (parsedJson.length > 0) {
                updateCurrentException(null, parsedJson[0]);
            } else {
                updateCurrentException(null, emptyException);
            }
        }
    }

    function parseJsonFile(jsonString) {
        return JSON.parse(jsonString).
            map((mn, index) =>{
                return {...mn, 'ref': index};
            });
    }

    const urls = [
        "https://do5dznmsu0r6j.cloudfront.net/Round_1-CAM_1.mp4",
        "https://do5dznmsu0r6j.cloudfront.net/Round_1-CAM_2.mp4",
        "https://do5dznmsu0r6j.cloudfront.net/Round_1-CAM_3.mp4",
        "https://do5dznmsu0r6j.cloudfront.net/Round_1-CAM_1.mp4",
        "https://do5dznmsu0r6j.cloudfront.net/Round_1-CAM_2.mp4",
        "https://do5dznmsu0r6j.cloudfront.net/Round_1-CAM_3.mp4",
        "https://do5dznmsu0r6j.cloudfront.net/Round_1-CAM_1.mp4",
        "https://do5dznmsu0r6j.cloudfront.net/Round_1-CAM_2.mp4",
        "https://do5dznmsu0r6j.cloudfront.net/Round_1-CAM_3.mp4"
    ];

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
    
          contextRef.current.closePath();
          contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      };


  const setupCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 640;
      canvas.height = 360;
      canvas.style.width = `${640}px`;
      canvas.style.height = `${360}px`;
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
        let scaleX = (640 / (right - left)).toFixed(2);
        let scaleY = (360 / (bottom - top)).toFixed(2);
        let offsetX = -left;
        let offsetY = -top;
        let transformStr = `scale(${scaleX}, ${scaleY}) translate(${offsetX}px, ${offsetY}px)`;
        return transformStr
      }

    const togglePlay = () => {
        if (isPlaying) {
            videoRef.current.pause();
            let num_frames = Math.round(videoRef.current.currentTime * fps);
            videoRef.current.currentTime = num_frames / fps;
            setTimeCode(videoRef.current.currentTime);
        } else {
            videoRef.current.play();
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
        step(-1);
      }
    
      const stepBackMulti = () => {
        step(-10);
      }
    
      function step(framesToStep) {
        let num_frames = Math.round(videoRef.current.currentTime * fps);
        num_frames += framesToStep;
        videoRef.current.currentTime = num_frames / fps;
        setTimeCode(videoRef.current.currentTime);
      }
    
      function updateURL(event, url) {
        let num_frames = Math.round(videoRef.current.currentTime * fps);
        videoRef.current.src = url;
        videoRef.current.currentTime = num_frames / fps;
        setTimeCode(videoRef.current.currentTime);
        setURL(url);
      }
    
      const camButtons = makeCamButtons(source_urls, URL, updateURL, isPlaying);

    const updateCurrentException = (e, exception) => {
        videoRef.current.currentTime = exception.startTime;
        setTimeCode(videoRef.current.currentTime);
        setCurrentException(exception);
    }

    const exitHandler = () => {
        exitScreen(false);
    }

    const exceptionBack = () => {
        const currentIndex = currentException.ref;
        if (currentIndex > 0) {
            const exception = jsonExceptions[currentIndex - 1];
            updateCurrentException(null, exception);
        }
    }

    const exceptionForward = () => {
        const currentIndex = currentException.ref;
        if (currentIndex < jsonExceptions.length) {
            const exception = jsonExceptions[currentIndex + 1];
            updateCurrentException(null, exception);
        }
    }

    const exceptionRows = jsonExceptions.map((exception, index) => 
    <tr
        key={`exception-row-${index}`}
        className={currentException.ref === index ? 'selected' : ''}
        onClick={(e) => {
            updateCurrentException(e, exception);
        }}>
        <td>{exception['exceptionType']}</td>
        <td>{exception['startTime'].toFixed(2)}</td>
        <td>{exceptionSummary(exception)}</td>
    </tr>
  );

    return (
        <>
        <div className='video-info-box-container'>
            <div className='video-view'>
            <div>
      {camButtons}
    </div>
    <div className="MultiVideoContainer">
      <div className="video-container">
        <video
            ref={videoRef}
            width="640"
            height="360"
            style={ {transform: rectToTransform(zoom)} }
            src={source_urls[0]}
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
        <button 
            onClick={togglePlay}>{isPlaying ? "Pause" : "Play"}
        </button>
        <button disabled={isPlaying} onClick={stepBackMulti}>&lt;&lt;</button>
        <button disabled={isPlaying} onClick={stepBack}>&lt;</button>
        <button disabled={isPlaying} onClick={stepForward}>&gt;</button>
        <button disabled={isPlaying} onClick={stepForwardMulti}>&gt;&gt;</button>
        <button disabled={isPlaying} onClick={toggleZooming}>{zoomState === 'unzoomed' ? 'Zoom' : 'Unzoom'}</button>
        
      </div>
                <div><br /><span>Timecode {timeCode}</span></div>
                <ExceptionInfoPane exception={currentException} />
            </div>
        </div>
        <div>
            <button onClick={exceptionBack}>&lt;</button>
            <button onClick={exceptionForward}>&gt;</button>
            <button onClick={exitHandler}>Exit</button>
            <input type="file" onChange={handleChange} />
        </div>    
        <div><span>Exceptions:</span></div>
        <ScrollView height="400px" width="600px">
            <table>
                <tbody>
                    {exceptionRows}
                </tbody>
            </table>
        </ScrollView>
        </>  
    );
};
 
export default PunchExceptionScreen;
