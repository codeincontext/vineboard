
var keysLoaded = 0;

var Key = (function() {

  function Key(element) {
    this.element = element;
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
    })
    this.element.addEventListener("touchend", function() {
      that.pause();
    })

    this.audioNode = audioContext.createMediaElementSource(this.video);
    this.gainNode = audioContext.createGainNode();
    this.audioNode.connect(this.gainNode);
    this.gainNode.connect(preEffectNode);
    this.gainNode.gain.value = 0.8;
  }

  Key.prototype.play = function() {
    this.element.classList.add('active');
    this.video.currentTime = 0;
    this.video.play();
  }

  Key.prototype.pause = function() {
    this.element.classList.remove('active');
    this.video.pause();
  }

  return Key;
})();
