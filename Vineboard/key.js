
var keysLoaded = 0;

var Key = (function() {

  function Key(element) {
    this.element = element;
    this.video = this.element.childNodes[1];

    this.audioNode = audioContext.createMediaElementSource(this.video);
    this.gainNode = audioContext.createGainNode();
    this.audioNode.connect(this.gainNode);
    this.gainNode.connect(preEffectNode);
    this.gainNode.gain.value = 0.8;
  }
  
  Key.prototype.play = function() {
    this.element.classList.add('active');
    this.video.play();
  }

  Key.prototype.pause = function() {
    this.element.classList.remove('active');
    this.video.pause();
  }

  return Key;
})();
