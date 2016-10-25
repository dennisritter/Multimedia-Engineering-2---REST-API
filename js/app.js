(function() {
    document.addEventListener("DOMContentLoaded", function() {

        var initVideos = function() {
            var videoContainers = document.getElementsByClassName('video-container');

            var video;
            var videoControls;

            if (videoContainers.length < 1) {
                console.error('I can´t find any .video-container elements on this page.');
                return;
            }

            for (var i = 0; i < videoContainers.length; ++i) {
                video = videoContainers[i].getElementsByClassName('video')[0];
                videoControls = videoContainers[i].getElementsByClassName('video-controls')[0];
                new Video(video, videoControls);
            }
        };

        initVideos();

        /**
         * @description A Video object that
         * @param element - The video DOM element
         * @param controls - The control DOM elements for this video
         * @constructor
         */
        function Video(element, controls) {
            var _this = this;

            /**
             * @description Binds callbackfunctions to specific events
             * @private
             */
            var _bind = function(){
                _this.controls.playpause.addEventListener('click', function() {
                    _this.play();
                });

                _this.controls.stop.addEventListener('click', function() {
                    _this.stop();
                });

                _this.controls.volInc.addEventListener('click', function() {
                    _this.volInc();
                });

                _this.controls.volDec.addEventListener('click', function() {
                    _this.volDec();
                });

                _this.controls.mute.addEventListener('click', function(){
                   _this.toggleMute();
                });

                _this.controls.fullscreen.addEventListener('click', function(){
                    _this.toggleFullscreen();
                });

                element.addEventListener('timeupdate', function () {
                    _this.updateTime();
                });
            };

            this.element = element;

            /* All control elements for this video */
            this.controls = {
                playpause: controls.getElementsByClassName('playpause')[0],
                stop: controls.getElementsByClassName('stop')[0],
                volInc: controls.getElementsByClassName('volinc')[0],
                volDec: controls.getElementsByClassName('voldec')[0],
                mute: controls.getElementsByClassName('mute')[0],
                fullscreen: controls.getElementsByClassName('fullscreen')[0],
                time: controls.getElementsByClassName('time')[0]
            };

            // register callbacks for events
            _bind();
        }

        /**
         * @description Starts/Pauses the video
         */
        Video.prototype.play = function(){
            if (this.controls.playpause.getAttribute('data-state') === 'play') {
                this.element.play();
                this.controls.playpause.setAttribute('data-state', 'pause');
            }
            else if (this.controls.playpause.getAttribute('data-state') === 'pause') {
                this.element.pause();
                this.controls.playpause.setAttribute('data-state', 'play');
            }
        };

        /**
         * @description Pauses the video and resets the played time to 0:00
         */
        Video.prototype.stop = function(){
            // if the user stops the video and pushes the play button after,
            // the data-state will be 'pause' and pause the video a second time. To avoid this, the data-state has to be 'play'
            var btnPlayPause = this.controls.playpause;
            if(!!btnPlayPause){
                btnPlayPause.setAttribute('data-state', 'play');
            };

            this.element.pause();
            this.element.currentTime = 0;
        };

        /**
         * @description Increases the videos sound by 10%, but never above 100%
         */
        Video.prototype.volInc = function(){
            if (this.element.volume >= 0.9) {
                this.element.volume = 1.0;
            }
            else {
                this.element.volume += 0.1;
            }
            this.element.muted = false;
        };

        /**
         * @description Decreases the videos sound by 10%, but never below 0%
         */
        Video.prototype.volDec = function(){
            if (this.element.volume <= 0.1) {
                this.element.volume = 0.0;
            }
            else {
                this.element.volume -= 0.1;
            }
            this.element.muted = false;
        };

        /**
         * @description Mutes/unmutes the video by toggling the 'muted' attribute
         */
        Video.prototype.toggleMute = function(){
            this.element.muted = !this.element.muted;
        };

        /**
         * @description Updates the time label
         */
        Video.prototype.updateTime = function () {
            var seconds = this.element.currentTime;
            var minutes = Math.floor(seconds/60);
            seconds -= minutes * 60;
            seconds = '' + Math.floor(seconds);
            minutes = '' + minutes;

            if (seconds.length < 2) {
                seconds = '0' + seconds;
            }

            if (minutes.length < 2) {
                minutes = '0' + minutes;
            }

            this.controls.time.innerHTML = minutes + ':' + seconds;
        };

        /**
         * @description Resizes the to fullscreen/initial size
         * TODO: find out how to implement fullscreen for videos
         */
        Video.prototype.toggleFullscreen = function(){
            //toggle fullscreen implementation
        };

    });
})();