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
var audioContext, preEffectNode, convNode, waveShaper;
var convolution = false;
var overdrive = false;

function enableConvolution() {
  preEffectNode.disconnect();
  preEffectNode.connect(convNode);
}

function disableConvolution() {
  preEffectNode.disconnect();
  preEffectNode.connect(audioContext.destination);
}

function enableOverdrive() {
  preEffectNode.disconnect();
  preEffectNode.connect(waveShaper);
}

function disableOverdrive() {
  preEffectNode.disconnect();
  preEffectNode.connect(audioContext.destination);
}

function setupAudio() {
  // Base audio
  audioContext = new webkitAudioContext;
  preEffectNode = audioContext.createGainNode();
  preEffectNode.connect(audioContext.destination);

  // Convolution
  convNode = audioContext.createConvolver();
  var convGainNode = audioContext.createGainNode();
  convNode.connect(convGainNode);
  convGainNode.connect(audioContext.destination);
  convGainNode.gain.value = 4.0;  // conv is quiet. boost it a bit

  // Overdrive
  var lowPassFreq = 7000;
  var lowPass = audioContext.createBiquadFilter();
  lowPass.type = 0;
  lowPass.frequency.value = lowPassFreq;
  waveShaper = audioContext.createWaveShaper();
  waveShaper.connect(lowPass);
  lowPass.connect(audioContext.destination);
    var k = 40; // this number matters
    var n_samples = 22050;
    var wsCurve = new Float32Array(n_samples);
    var deg = Math.PI / 180;
    for (var i = 0; i < n_samples; i += 1) {
        var x = i * 2 / n_samples - 1;
        wsCurve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
    }
    waveShaper.curve = wsCurve;


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
      } else {
        enableConvolution();
      }
      convolution = !convolution;
    } else if (aEvent.keyCode == 190) {
      if (overdrive) {
        disableOverdrive();
      } else {
        enableOverdrive();
      }
      overdrive = !overdrive;
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