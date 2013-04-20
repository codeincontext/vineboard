// todo:
// - use web audio
// - use web audio effects

var keyMapping = {
  65: 'c',
  87: 'csharp',
  83: 'd',
  69: 'dsharp',
  68: 'e',
  70: 'f',
  84: 'fsharp',
  71: 'g',
  89: 'gsharp',
  72: 'a',
  85: 'asharp',
  74: 'b',
  75: 'c2',
  79: 'c2sharp',
  76: 'd2',
  80: 'd2sharp',
  186: 'e2',
  222: 'f2',
  221: 'f2sharp',
  220: 'g2'
};

var keys = {};

var sustain = false;
var sustainedNotes = [];
var audioContext, preEffectNode, convNode;
var convolution = false;

function enableConvolution() {
  preEffectNode.disconnect();
  preEffectNode.connect(convNode);
}

function disableConvolution() {
  preEffectNode.disconnect();
  preEffectNode.connect(audioContext.destination);
}

function setupAudio() {
  audioContext = new webkitAudioContext;
  preEffectNode = audioContext.createGainNode();
  preEffectNode.connect(audioContext.destination);

  convNode = audioContext.createConvolver();
  var convGainNode = audioContext.createGainNode();
  // conv is quiet. boost it a bit
  var gainNode = audioContext.createGainNode();
  convNode.connect(convGainNode);
  convGainNode.connect(gainNode);
  gainNode.connect(audioContext.destination);
  gainNode.gain.value = 4.0;


  request = new XMLHttpRequest();

  request.open('GET', 'AK-SPKRS_VinUs_002.wav', true);
  request.responseType = 'arraybuffer';


  request.onload = function() {
      audioContext.decodeAudioData(/** @type {ArrayBuffer} */(request.response), function(buffer) {
          convNode.buffer = buffer;
      });
  };
  request.send();
}


function init() {
  setupAudio();

  for (var key in keyMapping) {
    if (keyMapping.hasOwnProperty(key)) {
      var videoElement = document.getElementById(keyMapping[key]);
      keys[key] = new Key(videoElement);
    }
  }
}
window.onload = init;

// var gainNode = 
// var videoElement = document.querySelector('video');
// var mediaSourceNode = context.createMediaElementSource(audioElement);
// mediaSourceNode.connect(filter);
// filter.connect(context.destination);

// var mediaElement = document.getElementById('mediaElementID');
// var sourceNode = context.createMediaElementSource(mediaElement);
// sourceNode.connect(audioContext.destination);


// this.gainNode.connect(audioContext.destination);

var onkeydown = function(aEvent) {
    // console.log(aEvent.keyCode);

    // Don't intercept keyboard shortcuts
    if (aEvent.altKey
      || aEvent.ctrlKey
      || aEvent.metaKey
      || aEvent.shiftKey) {
      return;
    }

    if (aEvent.keyCode == 32) {
      sustain = true;
    } else {

      var key = keys[aEvent.keyCode];
      if (!key) return;

      key.play();
    }

  }

  var onkeyup = function(aEvent) {

    // Don't intercept keyboard shortcuts
    if (aEvent.altKey
      || aEvent.ctrlKey
      || aEvent.metaKey
      || aEvent.shiftKey) {
      return;
    }

    if (aEvent.keyCode == 32) {
      sustain = false;
      // pause any vines that aren't currently being pressed
      sustainedNotes.forEach(function(key, i) {
        key.pause();
      });
    } else if (aEvent.keyCode == 188) {
      if (convolution) {
        disableConvolution();
      }  else {
        enableConvolution();
      }
      convolution = !convolution;
    } else if (aEvent.keyCode == 190) {
    } else if (aEvent.keyCode == 191) {

    } else {
      var key = keys[aEvent.keyCode];
      if (!key) return;


      if (sustain) {
        sustainedNotes.push(key);
      } else {
        key.pause();
      }
    }
  }

window.onkeydown = onkeydown;
document.onkeydown = window.onkeydown;

window.onkeyup = onkeyup;
document.onkeyup = window.onkeyup;