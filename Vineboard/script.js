// effects borrowed from https://github.com/dashersw/pedalboard.js/

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
var audioContext, preEffectNode, convNode, waveShaper, reverbConv;
var convolution = false;
var overdrive = false;
var reverb = false;

function enableConvolution() {
  disableEffects(false);
  preEffectNode.connect(convNode);
  convolution = true;
  document.getElementById('convolution').classList.add('active');
}

function disableEffects(reconnect) {
  preEffectNode.disconnect();
  if (reconnect) preEffectNode.connect(audioContext.destination);
  convolution = false;
  overdrive = false;
  reverb = false;
  document.getElementById('reverb').classList.remove('active');
  document.getElementById('overdrive').classList.remove('active');
  document.getElementById('convolution').classList.remove('active');
}

function enableOverdrive() {
  disableEffects(false);
  preEffectNode.connect(waveShaper);
  overdrive = true;
  document.getElementById('overdrive').classList.add('active');
}

function enableReverb() {
  disableEffects(false);
  preEffectNode.connect(reverbConv);
  reverb = true;
  document.getElementById('reverb').classList.add('active');

}

function setupAudio() {
  // Base audio
  audioContext = new webkitAudioContext;
  preEffectNode = audioContext.createGainNode();
  preEffectNode.connect(audioContext.destination);

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

  // Convolution
  convNode = audioContext.createConvolver();
  var convGainNode = audioContext.createGainNode();
  convNode.connect(convGainNode);
  convGainNode.connect(audioContext.destination);
  convGainNode.gain.value = 4.0;  // conv is quiet. boost it a bit

  request = new XMLHttpRequest();
  request.open('GET', 'AK-SPKRS_VinUs_002.wav', true);
  request.responseType = 'arraybuffer';

  request.onload = function() {
      audioContext.decodeAudioData(/** @type {ArrayBuffer} */(request.response), function(buffer) {
          convNode.buffer = buffer;
      });
  };
  request.send();

  // reverb
  reverbConv = audioContext.createConvolver();
  reverbConv.connect(audioContext.destination);
  request2 = new XMLHttpRequest();

  request2.open('GET', 'pcm90cleanplate.wav', true);
  request2.responseType = 'arraybuffer';

  request2.onload = function() {
      audioContext.decodeAudioData(/** @type {ArrayBuffer} */(request2.response), function(buffer) {
          reverbConv.buffer = buffer;
      });
  };
  request2.send();
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
      if (reverb) {
        disableEffects(true);
      } else {
        enableReverb();
      }
    } else if (aEvent.keyCode == 190) {
      if (overdrive) {
        disableEffects(true);
      } else {
        enableOverdrive();
      }
    } else if (aEvent.keyCode == 191) {
      if (convolution) {
        disableEffects(true);
      } else {
        enableConvolution();
      }
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