(function() {
    window.addEventListener("load", function() {

        var initVideos = function() {
            var videoContainers = document.getElementsByClassName('video-container');

            var video;
            var videoControls;
            for (var i = 0; i < videoContainers.length; ++i) {
                video = videoContainers[i].getElementsByClassName('video')[0];
                videoControls = videoContainers[i].getElementsByClassName('video-controls')[0];
                new Video(video, videoControls);
            }
        }
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
                    _this.play(this);
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
            };

            this.element = element;
            /* All controlelements for this video */
            this.controls = {
                playpause: controls.getElementsByClassName('playpause')[0],
                stop: controls.getElementsByClassName('stop')[0],
                volInc: controls.getElementsByClassName('volinc')[0],
                volDec: controls.getElementsByClassName('voldec')[0],
                mute: controls.getElementsByClassName('mute')[0],
                fullscreen: controls.getElementsByClassName('fullscreen')[0],
            }

            // register callbacks for events
            _bind();
        };

        /**
         * @description Starts/Pauses the video
         */
        Video.prototype.play = function(controlElement){
            if (controlElement.getAttribute('data-state') === 'play') {
                this.element.play();
                controlElement.setAttribute('data-state', 'pause');
            }
            else if (controlElement.getAttribute('data-state') === 'pause') {
                this.element.pause();
                controlElement.setAttribute('data-state', 'play');
            }
        };

        /**
         * @description Stops the video and resets the played time to 0:00
         * TODO: find out how to stop a video --> built in function?!
         */
        Video.prototype.stop = function(){
            this.element.load();
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
        };

        /**
         * @description Mutes/unmutes the video by toggling the 'muted' attribute
         */
        Video.prototype.toggleMute = function(){
            this.element.muted = !this.element.muted;
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