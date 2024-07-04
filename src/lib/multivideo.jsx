export const makeCamButtons = (urls, currentUrl, setURL, isPlaying) => 
  urls.map((url, index) =>
    <button
      key={`cam-button-${index}`}
      disabled={isPlaying}
      className={`cam-button ${url === currentUrl ? 'cam-button-selected' : ''}`} 
      onClick={(e) => {
          setURL(e, url);
      }}
    >
      CAM{index+1}
      </button>
  );

export const makeVideoSpeedButton = (currentSpeed, setSpeed) => 
    ['1x', '½x'].map((speed, index) =>
      <button
        key={`speed-button-${index}`}
        className={`cam-button ${index === currentSpeed ? 'cam-button-selected' : ''}`}
        onClick={(e) => {
          setSpeed(e, index);
        }}
        >
        {speed}
        </button>
  );
    


