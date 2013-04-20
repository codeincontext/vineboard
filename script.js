// cat loader
function MergeRecursive(a,b){for(var c in b)try{a[c]=b[c].constructor==Object?MergeRecursive(a[c],b[c]):b[c]}catch(d){a[c]=b[c]}return a}var Loading=function(a){var b=document.createElement("div"),c=document.createElement("div"),d=document.createElement("div"),e=document.createElement("div");e.innerHTML=0;var f={text:"{VAL} %",modal:{background:"rgba(0,0,0,0.7)",zIndex:9999999999},blur:!0,className:"wmas-loading"};a=MergeRecursive(f,a),this.countToLoad=0,this.loadedCount=0,this.objectLoaded=function(){this.loadedCount++,this.setCompletion(100*(this.loadedCount/this.countToLoad)),this.loadedCount>=this.countToLoad&&(document.body.removeChild(b),this.onFinished())},this.onFinished=function(){},this.setCompletion=function(b){return b>100?(b=100,void 0):(this.unBlur(25*((100-b)/100)),this.displayPercentage(b,a.text),void 0)};var g={modal:{position:"fixed",top:0,bottom:0,right:0,left:0,background:a.modal.background,zIndex:a.modal.zIndex},loading:{border:"11px solid #fff",position:"fixed",top:"50%",boxShadow:"0 0 5px rgba(0,0,0,0.3)",left:"50%",height:"320px",borderBottomWidth:"61px",borderRadius:"4px",width:"240px",marginLeft:"-141px",marginTop:"-200px"},loadingbar:{position:"absolute",right:0,color:"#222222",fontSize:"30px",left:0,bottom:0,height:"100%",webkitTransition:"all 2s",webkitFilter:"blur(25px)",webkitTransform:"translateZ(0)",mozTransform:"translateZ(0)",transform:"translateZ(0)",background:"url(http://ckingchristmas.s3.amazonaws.com/cat.gif)",backgroundPosition:"center bottom"},loadingtext:{position:"absolute",right:0,color:"#222222",fontSize:"30px",left:0,bottom:"-100%",height:"96%",textAlign:"center"}};a.blur||(g.loadingbar.webkitFilter="");var h=function(a,b,c){var d=parseInt(a.innerHTML,10);return d++,(d===b||d>b)&&(d=b),a.innerHTML=c.replace("{VAL}",parseInt(d,10)),d===b||d>b?(d=b,void 0):(htmlUpdate=setTimeout(function(){h(a,b,c)},50),void 0)},i=function(a,b){for(var c in b)a.style[c]=b[c]};return this.unBlur=function(b){b=parseInt(b,10),a.blur||(b=0),d.style.webkitFilter="blur("+b+"px)"},this.displayPercentage=function(a,b){h(e,a,b)},this.displayPercentage(0,a.text),i(b,g.modal),i(c,g.loading),i(d,g.loadingbar),i(e,g.loadingtext),c.className=a.className,b.appendChild(c),c.appendChild(d),c.appendChild(e),document.body.appendChild(b),this};

var loader;


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

  loader.countToLoad += 2;

  request = new XMLHttpRequest();
  request.open('GET', 'AK-SPKRS_VinUs_002.wav', true);
  request.responseType = 'arraybuffer';

  request.onload = function() {
      audioContext.decodeAudioData(/** @type {ArrayBuffer} */(request.response), function(buffer) {
          loader.objectLoaded();
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
          loader.objectLoaded();
          reverbConv.buffer = buffer;
      });
  };
  request2.send();
}


function init() {

  var noAudioEl = document.getElementById("no-audio");

  var noAudio = false;
  try {
    context = new webkitAudioContext();
  }
  catch(e) {
      noAudioEl.style.display = 'block';
      noAudio = true;
  }
  if (noAudio) return;

  loader = new Loading();
  var elements = document.querySelectorAll("video");
  console.log(elements.length);
  loader.countToLoad += elements.length;
  for (var i = 0; i < elements.length; i++) {
    var v = elements[i];
    v.addEventListener("canplaythrough", function() {
      loader.objectLoaded();
    });
    if (v.readystate === 4) {
      loader.objectLoaded();
    }
  }
  setupAudio();

  t = setTimeout(function() {
    for (var i = 0; i < loader.countToLoad; i++) {
      loader.objectLoaded();
    }
  }, 5000);

  loader.onFinished = function(){
    clearTimeout(t);
    for (var key in keyMapping) {
      if (keyMapping.hasOwnProperty(key)) {

        var videoElement = document.getElementById(keyMapping[key]);
        keys[key] = new Key(videoElement);
      }
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