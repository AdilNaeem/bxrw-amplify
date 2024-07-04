
    var data = {
        'round': 1,
        'selectedBoxer': 'boxer1',
        'boxers': {'boxer1': 'Nomi', 'boxer2': 'Mike'},
            'punchData': {'boxer1': [], 'boxer2': []},
    };
        // setup the button id to url mapping
        var id2url = null;

        document.addEventListener('DOMContentLoaded', function () {
            var listScreen = document.getElementById('list-screen');
            var labellingScreen = document.getElementById('labelling-screen');

            var vidButtons = Array(9).fill(0).map((_, i) => document.getElementById(`vid${i+1}`));
            var boxerRadios = document.querySelectorAll('input[name="boxer"]');

            var videoElement = document.getElementById('myVideo');
            var playButton = document.getElementById('playButton');
            var pauseButton = document.getElementById('pauseButton');
            pauseButton.disabled = true;
            var forwardButton = document.getElementById('forwardButton');
            var backButton = document.getElementById('backButton');
            var zoomButton = document.getElementById('zoomButton');
            var startPunchButton = document.getElementById('startPunchButton');
            var endPunchButton = document.getElementById('endPunchButton');
            var deletePunchButton = document.getElementById('deletePunchButton');
            var saveButton = document.getElementById('saveButton');
            var counterLabel = document.getElementById('counterLabel');
            var rectangleCoordinatesLabel = document.getElementById('rectangleCoordinates');
            var zoomRectangle = document.getElementById('zoomRectangle');
            var frameRate = 50;
            var frameCount = 0;
            var zoomed = false;
            var isMouseDown = false;
            var startCoordinates = { x: 0, y: 0 };

            // Function to update the label with the current frame count
            function updateLabel() {
                counterLabel.textContent = 'Frame Count: ' + frameCount;
            }

            // Function to handle button click event for playing the video
            function playVideo() {
                videoElement.play();
            }

            // Function to handle button click event for pausing the video
            function pauseVideo() {
                videoElement.pause();
            }

            // Function to handle button click event for forwarding frames
            function incrementCounter() {
                // Calculate the time to forward by one frame
                var frameTime = 1 / frameRate;

                // Increment the frame count
                frameCount++;

                // Forward the video by one frame
                videoElement.currentTime += frameTime;

                // Update the label
                updateLabel();
            }

            // Function to handle button click event for backing one frame
            function decrementCounter() {
                // Ensure the frame count is not negative
                if (frameCount > 0) {
                    // Calculate the time to go back by one frame
                    var frameTime = 1 / frameRate;

                    // Decrement the frame count
                    frameCount--;

                    // Go back in the video by one frame
                    videoElement.currentTime -= frameTime;

                    // Update the label
                    updateLabel();
                }
            }

            // Function to handle Start Punch button click event
            function startPunch() {
                alert('startPunch');
            }

            function endPunch() {
                alert('endPunch');
            }

            function deletePunch() {
                alert('deletePunch');
            }

            // Function to handle button click event for zooming
            function toggleZoom() {
                if (zoomed) {
                    // Reset the zoom transformation
                    videoElement.style.transform = 'none';

                    // crop to correct origin
                    videoElement.style.marginLeft = '0px';
                    videoElement.style.marginTop = '0px';
                }

                zoomed = !zoomed;

                if (zoomed) {
                    // Switch to "ready to zoom" state
                    videoElement.classList.add('zoomed');
                    zoomButton.textContent = 'Unzoom';

                    // Attach event listeners for mouse events
                    videoElement.addEventListener('mousedown', startDrawing);
                    videoElement.addEventListener('mousemove', continueDrawing);
                    videoElement.addEventListener('mouseup', stopDrawing);
                } else {
                    // Switch back to "normal" state
                    videoElement.classList.remove('zoomed');
                    zoomButton.textContent = 'Zoom';

                    // Remove event listeners for mouse events
                    videoElement.removeEventListener('mousedown', startDrawing);
                    videoElement.removeEventListener('mousemove', continueDrawing);
                    videoElement.removeEventListener('mouseup', stopDrawing);

                    // Clear the drawn rectangle
                    clearRectangle();
                }
            }

            // Function to start drawing the rectangle
            function startDrawing(event) {
                isMouseDown = true;
                startCoordinates = { x: event.clientX, y: event.clientY };
            }

            // Function to continue drawing the rectangle
            function continueDrawing(event) {
                if (isMouseDown) {
                    drawRectangle(startCoordinates, { x: event.clientX, y: event.clientY });
                }
            }

            // Function to stop drawing the rectangle
            function stopDrawing(event) {
                if (isMouseDown) {
                    isMouseDown = false;

                    // get bounding rect to calculate coordinates relative to element                 
                    var rect = event.target.getBoundingClientRect();

                    // Display rectangle coordinates in label
                    var endCoordinates = { x: event.clientX - rect.x, y: event.clientY - rect.y };
                    // Fix startCoordinates to be relative to element
                    startCoordinates = {x: startCoordinates.x - rect.x, y: startCoordinates.y - rect.y};

                    rectangleCoordinatesLabel.textContent = 'Rectangle Coordinates: ' +
                        '(' + startCoordinates.x + ', ' + startCoordinates.y + ') - ' +
                        '(' + endCoordinates.x + ', ' + endCoordinates.y + ')';

                    // Zoom to the selected area
                    zoomToArea(startCoordinates, endCoordinates);
                    
                    // Clear the drawn rectangle
                    clearRectangle();
                }
            }

            // Function to draw the rectangle on the video
            function drawRectangle(start, end) {
                var rectX = Math.min(start.x, end.x);
                var rectY = Math.min(start.y, end.y);
                var rectWidth = Math.abs(start.x - end.x);
                var rectHeight = Math.abs(start.y - end.y);

                // Set the position and size of the overlay div
                zoomRectangle.style.left = rectX + 'px';
                zoomRectangle.style.top = rectY + 'px';
                zoomRectangle.style.width = rectWidth + 'px';
                zoomRectangle.style.height = rectHeight + 'px';
            }

            // Function to clear the drawn rectangle
            function clearRectangle() {
                // Reset the position and size of the overlay div
                zoomRectangle.style.left = '-9999px';
                zoomRectangle.style.top = '-9999px';
                zoomRectangle.style.width = '0';
                zoomRectangle.style.height = '0';
            }


            // Function to zoom to the selected area
            function zoomToArea(start, end) {
                // Calculate zoom parameters
                var rectWidth = Math.abs(start.x - end.x);
                var rectHeight = Math.abs(start.y - end.y);
                var videoWidth = videoElement.clientWidth;
                var videoHeight = videoElement.clientHeight;

                // Calculate the scale factors
                var scaleX = videoWidth / rectWidth;
                var scaleY = videoHeight / rectHeight;

                // Calculate the position offset
                var offsetX = Math.min(start.x, end.x);
                var offsetY = Math.min(start.y, end.y);

                // Apply the zoom transformation
                videoElement.style.transformOrigin = 'top left';
                videoElement.style.transform = 'scale(' + scaleX + ', ' + scaleY + ')';
                strTransform = `scale(${scaleX}, ${scaleY}) translate(-${offsetX}px, -${offsetY}px)`;
                videoElement.style.transform = strTransform;
                
            }

            function toggleButtons() {
                playButton.disabled = !playButton.disabled;
                pauseButton.disabled = !pauseButton.disabled;
                backButton.disabled = !backButton.disabled;
                forwardButton.disabled = !forwardButton.disabled;
                zoomButton.disabled = !zoomButton.disabled;
                startPunchButton.disabled = !startPunchButton.disabled;
                endPunchButton.disabled = !endPunchButton.disabled; // this should only be enabled if we have a current start punch
                deletePunchButton.disabled = !deletePunchButton.disabled;
            }

            // Event listener for the timeupdate event to update frame count during playback
            videoElement.addEventListener('timeupdate', function () {
                // Calculate the frame count based on current time and frame rate
                frameCount = Math.floor(videoElement.currentTime * frameRate);

                // Update the label
                updateLabel();
            });

            // thrown when video starts to play after loading or pause
            videoElement.addEventListener('play', function () {
                toggleButtons();
            });

            // thrown when video is paused
            videoElement.addEventListener('pause', function () {
                toggleButtons();
            });

            // =============== inline functions here ====================
            function selectVideo() {
                // Store the current time
                var currentTime = videoElement.currentTime;
                // Replace 'newVideoURL.mp4' with the actual URL of the new video you want to load
    
                videoElement.src = id2url.get(this.id);
    
                // Set an event listener for when the video is loaded enough to play
                videoElement.addEventListener('canplay', function() {
                    // Set the current time to the stored time
                    videoElement.currentTime = currentTime;
                    // Play the video
                    //videoElement.play();
                }, { once: true }); // The { once: true } option auto-removes the event listener after it runs
            }
    
            function selectRoundItem() {
                // Setup the correct vid id to url mapping
                var roundId = this.id.substr(this.id.length - 1);
                id2url = new Map(Array(9).fill(0).map((_, i) => [`vid${i+1}`, `https://do5dznmsu0r6j.cloudfront.net/Round_${roundId}-CAM_${(i % 3) + 1}.mp4`]));
            
                // Add source to the video element
                var source = document.createElement('source');
                source.setAttribute('src', id2url.get('vid1'));
                source.setAttribute('type', 'video/mp4');
    
                // Add the source element to the video element
                videoElement.appendChild(source);
    
                // update info box with any current punch data
                updateInfoBox(data);
          
                labellingScreen.style.display = 'block';
                listScreen.style.display = 'none';
            }
    
            function updateInfoBox(data) {
                var selectedBoxerId = data['selectedBoxer'];
                var selectedBoxerName = data['boxers'][selectedBoxerId];
                var boxerNameField = document.getElementById('info-box-boxer-name');
                boxerNameField.innerText = selectedBoxerName;
            }
    
            function boxerSelectionUpdate() {
              // Select the checked radio button from the group named 'boxer'
              var selectedBoxer = document.querySelector('input[name="boxer"]:checked').value;
            
              // Additional code for what you want to do with the selected value
              data['selectedBoxer'] = selectedBoxer;
    
              updateInfoBox(data);
            }
            // --------------- inline functions end  --------------------

            // Configure screen selection logic
            const listItems = listScreen.getElementsByTagName('p');
            const listArray = [...listItems];
            listArray.forEach((item) => {item.addEventListener('click', selectRoundItem)});

            // Attach the playVideo function to the play button click event
            playButton.addEventListener('click', playVideo);

            // Attach the pauseVideo function to the pause button click event
            pauseButton.addEventListener('click', pauseVideo);

            // Attach the incrementCounter function to the forward button click event
            forwardButton.addEventListener('click', incrementCounter);

            // Attach the decrementCounter function to the back button click event
            backButton.addEventListener('click', decrementCounter);

            // Attach the toggleZoom function to the zoom button click event
            zoomButton.addEventListener('click', toggleZoom);

            // Attach start, end and delete punch functions to relevant button click event
            startPunchButton.addEventListener('click', startPunch);
            endPunchButton.addEventListener('click', endPunch);
            deletePunchButton.addEventListener('click', deletePunch);

            // Attach selectVideo to the video buttons
            vidButtons.forEach((button) => button.addEventListener('click', selectVideo));

           // Add onchange event listener to each radio button
           boxerRadios.forEach(function(radio) {
               radio.addEventListener('change', boxerSelectionUpdate);
           });

            // Initial update of the label
            updateLabel();
        });


