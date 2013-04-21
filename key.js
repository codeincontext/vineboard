
var keysLoaded = 0;

var Key = (function() {

  function Key(element, note) {
    this.element = element;
    this.note = note;
    var that = this;
    this.video = this.element.childNodes[2];
    this.element.addEventListener("mousedown", function() {
      that.play();
    });
    this.element.addEventListener("touchstart", function() {
      that.play();
    });
    this.element.addEventListener("mouseup", function() {
      that.pause();
    });
    this.element.addEventListener("touchend", function() {
      that.pause();
    });
    this.video.addEventListener("timeupdate", function() {
      if (that.video.currentTime > 5) that.video.currentTime = 1;
    });


    this.audioNode = audioContext.createMediaElementSource(this.video);
    this.gainNode = audioContext.createGainNode();
    this.audioNode.connect(this.gainNode);
    this.gainNode.connect(preEffectNode);
    this.gainNode.gain.value = 0.8;
  }

  Key.prototype.play = function() {

    if (this.video.currentTime === 0)
      this.video.currentTime = 1;
    this.element.classList.add('active');
    this.video.play();
    _gaq.push(['_trackEvent'], 'keypress', "pressed"+this.note);
  }

  Key.prototype.pause = function() {

    this.element.classList.remove('active');
    this.video.pause();

  }

  return Key;
})();
