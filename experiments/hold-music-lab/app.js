/* ============================================================
   Why Hold Music Sounds Terrible — Phone Audio Lab
   Canvas visualizations + WebAudio listening lab.
   No external dependencies.
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(id) { return document.getElementById(id); }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  /* ---------------- Predict boxes ---------------- */
  var predictFeedback = {
    p0: "Correct. Speech intelligibility lives in the middle band. Bass carries rhythm and highs carry sparkle, but words survive on formants between roughly 300 and 3400 Hz.",
    p1: "Correct. The 110 Hz fundamental is below the 300 Hz wall, so it is removed. You hear harmonics at 220 Hz and above, which the ear interprets as a thinner, higher note.",
    p2: "Correct. 8000 minus 6000 is 2000 Hz. The tone folds over the 4000 Hz Nyquist ceiling and appears as a false 2000 Hz tone. This is aliasing.",
    p3: "Correct. Quiet passages get only a few quantization steps under mu-law when loud sounds dominate the range, so they drown in noise. Speech tolerates this. Music does not.",
    p4: "Correct. The phone chain strips bass and highs, leaving a thin, tinny middle. That is the tunnel from Lab 1 plus companding from Lab 3.",
    p5: "Correct. The PSTN leg only speaks G.711 narrowband, so the whole call is transcoded down to that. Modern codecs on either end cannot recover what the gateway removed.",
    p6: "Correct. Transcoding down is lossy and irreversible. The phones can only decode what the gateway sends, which is narrowband."
  };

  document.querySelectorAll("[data-predict]").forEach(function (box) {
    var key = box.getAttribute("data-predict");
    var feedback = box.querySelector(".predict-feedback");
    var buttons = box.querySelectorAll(".predict-options button");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var correct = btn.getAttribute("data-correct") === "true";
        buttons.forEach(function (b) {
          b.disabled = true;
          if (b.getAttribute("data-correct") === "true") b.classList.add("correct");
        });
        if (!correct) btn.classList.add("wrong");
        feedback.hidden = false;
        feedback.innerHTML = correct
          ? "<strong>Right.</strong> " + (predictFeedback[key] || "")
          : "<strong class=\"bad\">Not quite.</strong> " + (predictFeedback[key] || "");
      });
    });
  });

  /* ---------------- Reveal on scroll ---------------- */
  if ("IntersectionObserver" in window && !reduceMotion) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll(".lab").forEach(function (el) {
      el.classList.add("reveal");
      observer.observe(el);
    });
  }

  /* ============================================================
     LAB 1: Spectrum tunnel
     Teaching model: log frequency axis 20 Hz to 20 kHz.
     Music energy: broad, bass heavy + mid + highs.
     Voice formants: peaks near 500 / 1500 / 2500 Hz.
     ============================================================ */
  var specCanvas = $("spectrumCanvas");
  var specCtx = specCanvas.getContext("2d");
  var lowWall = $("lowWall"), highWall = $("highWall");
  var lowWallOut = $("lowWallOut"), highWallOut = $("highWallOut");
  var spectrumSource = $("spectrumSource"), spectrumWhy = $("spectrumWhy");

  function freqToX(f, w, padL, padR) {
    var minF = 20, maxF = 20000;
    var t = (Math.log(f) - Math.log(minF)) / (Math.log(maxF) - Math.log(minF));
    return padL + t * (w - padL - padR);
  }
  function xToFreq(x, w, padL, padR) {
    var minF = 20, maxF = 20000;
    var t = (x - padL) / (w - padL - padR);
    return Math.exp(Math.log(minF) + t * (Math.log(maxF) - Math.log(minF)));
  }

  function musicLevel(f) {
    // Broad music spectrum: strong bass, mid body, extended highs.
    var bass = 0.95 * Math.exp(-Math.pow((Math.log(f) - Math.log(120)) / 0.9, 2));
    var mid = 0.75 * Math.exp(-Math.pow((Math.log(f) - Math.log(800)) / 1.1, 2));
    var high = 0.55 * Math.exp(-Math.pow((Math.log(f) - Math.log(6000)) / 0.9, 2));
    var floor = 0.08;
    return clamp(bass + mid + high + floor, 0, 1);
  }
  function voiceLevel(f) {
    var f1 = 0.9 * Math.exp(-Math.pow((Math.log(f) - Math.log(500)) / 0.35, 2));
    var f2 = 0.85 * Math.exp(-Math.pow((Math.log(f) - Math.log(1500)) / 0.3, 2));
    var f3 = 0.7 * Math.exp(-Math.pow((Math.log(f) - Math.log(2500)) / 0.3, 2));
    var fric = 0.25 * Math.exp(-Math.pow((Math.log(f) - Math.log(5000)) / 0.5, 2));
    return clamp(f1 + f2 + f3 + fric, 0, 1);
  }

  function drawSpectrum() {
    var w = specCanvas.width, h = specCanvas.height;
    var padL = 56, padR = 16, padT = 20, padB = 44;
    var plotH = h - padT - padB;
    var lo = parseInt(lowWall.value, 10), hi = parseInt(highWall.value, 10);
    if (hi <= lo + 200) { hi = lo + 200; highWall.value = hi; }
    lowWallOut.textContent = lo + " Hz";
    highWallOut.textContent = hi + " Hz";

    specCtx.clearRect(0, 0, w, h);
    specCtx.fillStyle = "#0a0e14";
    specCtx.fillRect(0, 0, w, h);

    // Grid lines at decade frequencies.
    specCtx.strokeStyle = "#21262d";
    specCtx.fillStyle = "#6e7681";
    specCtx.font = "11px ui-monospace, monospace";
    specCtx.textAlign = "center";
    [100, 1000, 10000].forEach(function (f) {
      var x = freqToX(f, w, padL, padR);
      specCtx.beginPath(); specCtx.moveTo(x, padT); specCtx.lineTo(x, padT + plotH); specCtx.stroke();
      specCtx.fillText(f >= 1000 ? (f / 1000) + "k" : f + "", x, h - 26);
    });
    specCtx.textAlign = "left";
    specCtx.fillText("Frequency (log scale)", padL, h - 8);

    // Tunnel shading.
    var xLo = freqToX(lo, w, padL, padR), xHi = freqToX(hi, w, padL, padR);
    specCtx.fillStyle = "rgba(88,166,255,0.12)";
    specCtx.fillRect(xLo, padT, xHi - xLo, plotH);
    specCtx.strokeStyle = "#58a6ff";
    specCtx.lineWidth = 2;
    specCtx.beginPath(); specCtx.moveTo(xLo, padT); specCtx.lineTo(xLo, padT + plotH); specCtx.stroke();
    specCtx.beginPath(); specCtx.moveTo(xHi, padT); specCtx.lineTo(xHi, padT + plotH); specCtx.stroke();
    specCtx.lineWidth = 1;
    specCtx.fillStyle = "#58a6ff";
    specCtx.font = "bold 11px ui-monospace, monospace";
    specCtx.textAlign = "center";
    specCtx.fillText("PHONE PASSES", (xLo + xHi) / 2, padT + 14);
    specCtx.textAlign = "left";

    function drawCurve(levelFn, color, fill) {
      specCtx.beginPath();
      var steps = 220;
      for (var i = 0; i <= steps; i++) {
        var f = xToFreq(padL + (i / steps) * (w - padL - padR), w, padL, padR);
        var lvl = levelFn(f);
        var x = freqToX(f, w, padL, padR);
        var y = padT + plotH - lvl * plotH;
        if (i === 0) specCtx.moveTo(x, y); else specCtx.lineTo(x, y);
      }
      specCtx.strokeStyle = color;
      specCtx.lineWidth = 2.5;
      specCtx.stroke();
      specCtx.lineWidth = 1;
      if (fill) {
        specCtx.lineTo(freqToX(20000, w, padL, padR), padT + plotH);
        specCtx.lineTo(freqToX(20, w, padL, padR), padT + plotH);
        specCtx.closePath();
        specCtx.fillStyle = fill;
        specCtx.fill();
      }
    }

    var src = spectrumSource.value;
    if (src === "music" || src === "both") drawCurve(musicLevel, "#f0883e", "rgba(240,136,62,0.15)");
    if (src === "voice" || src === "both") drawCurve(voiceLevel, "#3fb950", "rgba(63,185,80,0.15)");

    // Energy kept estimate (teaching model, integrated over log freq).
    function keptFraction(levelFn) {
      var total = 0, kept = 0, steps = 300;
      for (var i = 0; i <= steps; i++) {
        var f = xToFreq(padL + (i / steps) * (w - padL - padR), w, padL, padR);
        var v = levelFn(f);
        total += v;
        if (f >= lo && f <= hi) kept += v;
      }
      return total > 0 ? kept / total : 0;
    }
    var musicKept = keptFraction(musicLevel);
    var voiceKept = keptFraction(voiceLevel);
    specCtx.fillStyle = "#f0f6fc";
    specCtx.font = "12px ui-monospace, monospace";
    specCtx.textAlign = "left";
    specCtx.fillText("Music energy kept: " + Math.round(musicKept * 100) + "%", padL, padT + 14);
    specCtx.fillStyle = "#3fb950";
    specCtx.fillText("Voice energy kept: " + Math.round(voiceKept * 100) + "%", padL, padT + 30);

    if (lo === 300 && hi === 3400) {
      spectrumWhy.textContent = "Classic walls at 300 and 3400 Hz: most music energy is outside the tunnel, while speech formants sit inside it. That is why words survive and songs do not.";
    } else if (hi >= 7000 && lo <= 100) {
      spectrumWhy.textContent = "Wide tunnel: you opened the walls toward wideband. Music keeps far more energy, which is why HD Voice sounds so much more natural.";
    } else {
      spectrumWhy.textContent = "Tunnel at " + lo + " to " + hi + " Hz. Music kept about " + Math.round(musicKept * 100) + "%, voice kept about " + Math.round(voiceKept * 100) + "% in this teaching model.";
    }
  }
  [lowWall, highWall, spectrumSource].forEach(function (el) {
    el.addEventListener("input", drawSpectrum);
    el.addEventListener("change", drawSpectrum);
  });
  drawSpectrum();

  /* ============================================================
     LAB 2: Nyquist / aliasing
     ============================================================ */
  var nyqCanvas = $("nyquistCanvas");
  var nyqCtx = nyqCanvas.getContext("2d");
  var toneFreq = $("toneFreq"), sampleRate = $("sampleRate");
  var toneFreqOut = $("toneFreqOut"), sampleRateOut = $("sampleRateOut"), nyquistWhy = $("nyquistWhy");

  function drawNyquist() {
    var w = nyqCanvas.width, h = nyqCanvas.height;
    var padL = 56, padR = 16, padT = 24, padB = 44;
    var plotH = h - padT - padB;
    var f = parseInt(toneFreq.value, 10), fs = parseInt(sampleRate.value, 10);
    toneFreqOut.textContent = f + " Hz";
    sampleRateOut.textContent = fs + " Hz";
    var ceiling = fs / 2;

    nyqCtx.clearRect(0, 0, w, h);
    nyqCtx.fillStyle = "#0a0e14";
    nyqCtx.fillRect(0, 0, w, h);

    // Time window: 4 cycles of the tone, min 2ms.
    var windowSec = Math.max(4 / f, 0.0005);
    var midY = padT + plotH / 2;
    var amp = plotH * 0.38;

    // Axes.
    nyqCtx.strokeStyle = "#30363d";
    nyqCtx.beginPath(); nyqCtx.moveTo(padL, midY); nyqCtx.lineTo(w - padR, midY); nyqCtx.stroke();
    nyqCtx.fillStyle = "#6e7681";
    nyqCtx.font = "11px ui-monospace, monospace";
    nyqCtx.textAlign = "left";
    nyqCtx.fillText("Original tone " + f + " Hz (orange)", padL, padT - 6);
    nyqCtx.fillText("Reconstructed from samples (blue)", padL, padT + 12);

    // Original wave.
    nyqCtx.strokeStyle = "#f0883e";
    nyqCtx.lineWidth = 2;
    nyqCtx.beginPath();
    for (var i = 0; i <= 400; i++) {
      var t = (i / 400) * windowSec;
      var x = padL + (i / 400) * (w - padL - padR);
      var y = midY - Math.sin(2 * Math.PI * f * t) * amp;
      if (i === 0) nyqCtx.moveTo(x, y); else nyqCtx.lineTo(x, y);
    }
    nyqCtx.stroke();
    nyqCtx.lineWidth = 1;

    // Samples.
    var nSamples = Math.floor(fs * windowSec) + 1;
    nyqCtx.fillStyle = "#f0f6fc";
    var samplePts = [];
    for (var s = 0; s < nSamples; s++) {
      var ts = s / fs;
      var xs = padL + (ts / windowSec) * (w - padL - padR);
      var ys = midY - Math.sin(2 * Math.PI * f * ts) * amp;
      samplePts.push({ x: xs, y: ys, t: ts });
      nyqCtx.beginPath();
      nyqCtx.arc(xs, ys, 3.5, 0, Math.PI * 2);
      nyqCtx.fill();
    }

    // Reconstructed (aliased) wave: fold frequency.
    var fAlias = f;
    var aliased = f > ceiling;
    if (aliased) {
      // Fold into [0, ceiling] by reflecting over multiples of fs.
      var k = Math.floor(f / fs);
      var rem = f - k * fs;
      fAlias = (k % 2 === 0) ? rem : fs - rem;
      if (fAlias > ceiling) fAlias = fs - fAlias;
    }
    nyqCtx.strokeStyle = "#58a6ff";
    nyqCtx.lineWidth = 2;
    nyqCtx.setLineDash([6, 4]);
    nyqCtx.beginPath();
    for (var j = 0; j <= 400; j++) {
      var tj = (j / 400) * windowSec;
      var xj = padL + (j / 400) * (w - padL - padR);
      var yj = midY - Math.sin(2 * Math.PI * fAlias * tj) * amp;
      if (j === 0) nyqCtx.moveTo(xj, yj); else nyqCtx.lineTo(xj, yj);
    }
    nyqCtx.stroke();
    nyqCtx.setLineDash([]);
    nyqCtx.lineWidth = 1;

    nyqCtx.fillStyle = aliased ? "#f85149" : "#3fb950";
    nyqCtx.font = "bold 12px ui-monospace, monospace";
    var msg = aliased
      ? "ALIASED: hears " + Math.round(fAlias) + " Hz, not " + f + " Hz"
      : "OK: " + f + " Hz is below the " + ceiling + " Hz ceiling";
    nyqCtx.fillText(msg, padL, h - 26);

    if (aliased) {
      nyquistWhy.textContent = f + " Hz is above the " + ceiling + " Hz Nyquist ceiling for " + fs + " Hz sampling, so it folds to " + Math.round(fAlias) + " Hz. Real phones filter this out before sampling, which is why music sounds dull instead of buzzy.";
    } else {
      nyquistWhy.textContent = f + " Hz is below the " + ceiling + " Hz ceiling, so the samples reconstruct the tone correctly. At the phone rate of 8000 Hz, the ceiling is 4000 Hz, which is why the tunnel ends near 3400 Hz.";
    }
  }
  [toneFreq, sampleRate].forEach(function (el) { el.addEventListener("input", drawNyquist); });
  drawNyquist();

  /* ============================================================
     LAB 3: Mu-law + bitrate bars
     ============================================================ */
  var mulawCanvas = $("mulawCanvas");
  var mulawCtx = mulawCanvas.getContext("2d");
  var muValue = $("muValue"), muValueOut = $("muValueOut"), mulawMode = $("mulawMode"), mulawWhy = $("mulawWhy");

  function mulaw(x, mu) {
    var sign = x < 0 ? -1 : 1;
    return sign * Math.log(1 + mu * Math.abs(x)) / Math.log(1 + mu);
  }

  function drawMulaw() {
    var w = mulawCanvas.width, h = mulawCanvas.height;
    var padL = 56, padR = 16, padT = 20, padB = 44;
    var plotW = w - padL - padR, plotH = h - padT - padB;
    var mu = parseInt(muValue.value, 10);
    muValueOut.textContent = String(mu);

    mulawCtx.clearRect(0, 0, w, h);
    mulawCtx.fillStyle = "#0a0e14";
    mulawCtx.fillRect(0, 0, w, h);

    // Axes: input x in [-1,1], output y in [-1,1].
    var midX = padL + plotW / 2, midY = padT + plotH / 2;
    mulawCtx.strokeStyle = "#30363d";
    mulawCtx.beginPath(); mulawCtx.moveTo(padL, midY); mulawCtx.lineTo(w - padR, midY); mulawCtx.stroke();
    mulawCtx.beginPath(); mulawCtx.moveTo(midX, padT); mulawCtx.lineTo(midX, padT + plotH); mulawCtx.stroke();
    mulawCtx.fillStyle = "#6e7681";
    mulawCtx.font = "11px ui-monospace, monospace";
    mulawCtx.textAlign = "left";
    mulawCtx.fillText("Input amplitude", w - padR - 110, h - 26);
    mulawCtx.fillText("Output", padL, padT - 6);

    if (mulawMode.value === "curve") {
      mulawCtx.strokeStyle = "#58a6ff";
      mulawCtx.lineWidth = 2.5;
      mulawCtx.beginPath();
      for (var i = 0; i <= 300; i++) {
        var x = -1 + (i / 300) * 2;
        var y = mulaw(x, mu);
        var px = padL + ((x + 1) / 2) * plotW;
        var py = padT + ((1 - y) / 2) * plotH;
        if (i === 0) mulawCtx.moveTo(px, py); else mulawCtx.lineTo(px, py);
      }
      mulawCtx.stroke();
      mulawCtx.lineWidth = 1;
      // Linear reference.
      mulawCtx.strokeStyle = "#30363d";
      mulawCtx.setLineDash([4, 4]);
      mulawCtx.beginPath();
      mulawCtx.moveTo(padL, padT); mulawCtx.lineTo(w - padR, padT + plotH);
      mulawCtx.stroke();
      mulawCtx.setLineDash([]);
      mulawWhy.textContent = "Mu of " + mu + ". The curve bends so small amplitudes get stretched and loud amplitudes get compressed. That is how 8 bits cover a wide dynamic range for speech.";
    } else {
      // Quantization steps: 256 levels in mu-law domain mapped back.
      var levels = 256;
      mulawCtx.fillStyle = "#58a6ff";
      for (var k = 0; k < levels; k++) {
        var yq = -1 + (k / (levels - 1)) * 2;
        // Inverse mu-law: x = sign * ((1+mu)^|y| - 1) / mu
        var sign = yq < 0 ? -1 : 1;
        var xq = sign * (Math.pow(1 + mu, Math.abs(yq)) - 1) / mu;
        var pxq = padL + ((xq + 1) / 2) * plotW;
        var pyq = padT + ((1 - yq) / 2) * plotH;
        mulawCtx.fillRect(pxq - 1, pyq - 1, 2, 2);
      }
      mulawWhy.textContent = "256 quantization steps in the mu-law domain. Steps cluster near zero, where speech detail lives, and spread out at loud amplitudes. Quiet music under a loud chorus gets very few steps.";
    }
  }
  [muValue, mulawMode].forEach(function (el) { el.addEventListener("input", drawMulaw); el.addEventListener("change", drawMulaw); });
  drawMulaw();

  // Bitrate bars.
  var bitrates = [
    { name: "G.729 speech", kbps: 8, cls: "speech" },
    { name: "AMR-WB", kbps: 24, cls: "speech" },
    { name: "G.711 phone", kbps: 64, cls: "speech" },
    { name: "Opus speech", kbps: 32, cls: "speech" },
    { name: "Opus music", kbps: 128, cls: "music" },
    { name: "MP3 music", kbps: 320, cls: "music" }
  ];
  var barsEl = $("bitrateBars");
  var maxK = 320;
  bitrates.forEach(function (b) {
    var row = document.createElement("div");
    row.className = "bitrate-row";
    row.innerHTML = "<span class=\"name\">" + b.name + "</span><span class=\"bitrate-track\"><span class=\"bitrate-fill " + b.cls + "\" style=\"width:" + Math.max(3, (b.kbps / maxK) * 100) + "%\"></span></span><span class=\"val\">" + b.kbps + " kbps</span>";
    barsEl.appendChild(row);
  });

  /* ============================================================
     LAB 4: Listening lab (WebAudio)
     Music loop: C - Am - F - G pad + bass + melody, synthesized.
     Voice: formant-ish saw through bandpass filters.
     Phone chain: highpass 300 + lowpass 3400 + mu-law waveshaper.
     ============================================================ */
  var waveCanvas = $("waveCanvas"), specCanvas2 = $("specCanvas");
  var waveCtx = waveCanvas.getContext("2d"), specCtx2 = specCanvas2.getContext("2d");
  var playBtn = $("playBtn"), voiceBtn = $("voiceBtn"), stopBtn = $("stopBtn");
  var listenWhy = $("listenWhy");
  var modeBtns = document.querySelectorAll(".mode-btn");

  var audioCtx = null;
  var masterGain = null, analyser = null, analyserFreq = null;
  var currentSource = null; // { nodes: [], stop: fn }
  var currentMode = "full";
  var isPlaying = false;

  var modeWhy = {
    full: "Full fidelity: the loop reaches your speakers unfiltered. Switch to phone mode and listen for the bass and highs disappearing.",
    phone: "Phone mode: 300 to 3400 Hz band limit plus mu-law companding. The music turns thin and tinny. Try the sung vowel, it stays intelligible.",
    wideband: "Wideband mode: 50 to 7000 Hz. Noticeably warmer and more natural than phone mode, still not full fidelity. That gap is the HD Voice trade."
  };

  function ensureCtx() {
    if (!audioCtx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AC();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = 0.5;
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      analyserFreq = audioCtx.createAnalyser();
      analyserFreq.fftSize = 2048;
      masterGain.connect(audioCtx.destination);
      masterGain.connect(analyser);
      masterGain.connect(analyserFreq);
      startScopes();
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
  }

  function mulawShaperCurve(mu) {
    var n = 1024;
    var curve = new Float32Array(n);
    for (var i = 0; i < n; i++) {
      var x = (i / (n - 1)) * 2 - 1;
      curve[i] = mulaw(x, mu);
    }
    return curve;
  }

  function buildChain(mode) {
    // Returns input node to connect sources into.
    var input = audioCtx.createGain();
    if (mode === "full") {
      input.connect(masterGain);
    } else if (mode === "phone") {
      var hp = audioCtx.createBiquadFilter();
      hp.type = "highpass"; hp.frequency.value = 300; hp.Q.value = 0.7;
      var lp = audioCtx.createBiquadFilter();
      lp.type = "lowpass"; lp.frequency.value = 3400; lp.Q.value = 0.7;
      var shaper = audioCtx.createWaveShaper();
      shaper.curve = mulawShaperCurve(255);
      shaper.oversample = "2x";
      var post = audioCtx.createGain();
      post.gain.value = 1.4;
      input.connect(hp); hp.connect(lp); lp.connect(shaper); shaper.connect(post); post.connect(masterGain);
    } else if (mode === "wideband") {
      var hp2 = audioCtx.createBiquadFilter();
      hp2.type = "highpass"; hp2.frequency.value = 50; hp2.Q.value = 0.7;
      var lp2 = audioCtx.createBiquadFilter();
      lp2.type = "lowpass"; lp2.frequency.value = 7000; lp2.Q.value = 0.7;
      input.connect(hp2); hp2.connect(lp2); lp2.connect(masterGain);
    }
    return input;
  }

  function stopCurrent() {
    if (currentSource) {
      try { currentSource.stop(); } catch (e) {}
      currentSource = null;
    }
    isPlaying = false;
    playBtn.textContent = "Play music loop";
    voiceBtn.textContent = "Play sung vowel";
  }

  // Music loop: 8 seconds, C Am F G, pad + bass + melody + soft noise hat.
  function playMusic() {
    ensureCtx();
    stopCurrent();
    isPlaying = true;
    playBtn.textContent = "Playing music loop…";
    var dest = buildChain(currentMode);
    var t0 = audioCtx.currentTime + 0.05;
    var nodes = [];
    var timer = null;

    var chords = [
      { root: 130.81, notes: [261.63, 329.63, 392.00], melody: [523.25, 659.25, 783.99, 659.25] }, // C
      { root: 110.00, notes: [220.00, 261.63, 329.63], melody: [440.00, 523.25, 659.25, 523.25] }, // Am
      { root: 87.31,  notes: [174.61, 220.00, 261.63], melody: [349.23, 440.00, 523.25, 440.00] }, // F
      { root: 98.00,  notes: [196.00, 246.94, 293.66], melody: [392.00, 493.88, 587.33, 493.88] }  // G
    ];
    var chordDur = 2.0;

    chords.forEach(function (chord, ci) {
      var start = t0 + ci * chordDur;
      // Bass.
      var bass = audioCtx.createOscillator();
      bass.type = "triangle"; bass.frequency.value = chord.root;
      var bassGain = audioCtx.createGain();
      bassGain.gain.setValueAtTime(0.0001, start);
      bassGain.gain.exponentialRampToValueAtTime(0.35, start + 0.05);
      bassGain.gain.setValueAtTime(0.35, start + chordDur - 0.15);
      bassGain.gain.exponentialRampToValueAtTime(0.0001, start + chordDur);
      bass.connect(bassGain); bassGain.connect(dest);
      bass.start(start); bass.stop(start + chordDur + 0.05);
      nodes.push(bass);
      // Pad.
      chord.notes.forEach(function (f) {
        var osc = audioCtx.createOscillator();
        osc.type = "sawtooth"; osc.frequency.value = f;
        var lp = audioCtx.createBiquadFilter();
        lp.type = "lowpass"; lp.frequency.value = 1800;
        var g = audioCtx.createGain();
        g.gain.setValueAtTime(0.0001, start);
        g.gain.exponentialRampToValueAtTime(0.07, start + 0.2);
        g.gain.setValueAtTime(0.07, start + chordDur - 0.3);
        g.gain.exponentialRampToValueAtTime(0.0001, start + chordDur);
        osc.connect(lp); lp.connect(g); g.connect(dest);
        osc.start(start); osc.stop(start + chordDur + 0.05);
        nodes.push(osc);
      });
      // Melody: 4 eighth notes per chord.
      var step = chordDur / 4;
      chord.melody.forEach(function (f, mi) {
        var s = start + mi * step;
        var osc2 = audioCtx.createOscillator();
        osc2.type = "square"; osc2.frequency.value = f;
        var lp2 = audioCtx.createBiquadFilter();
        lp2.type = "lowpass"; lp2.frequency.value = 4000;
        var g2 = audioCtx.createGain();
        g2.gain.setValueAtTime(0.0001, s);
        g2.gain.exponentialRampToValueAtTime(0.12, s + 0.02);
        g2.gain.exponentialRampToValueAtTime(0.0001, s + step * 0.9);
        osc2.connect(lp2); lp2.connect(g2); g2.connect(dest);
        osc2.start(s); osc2.stop(s + step);
        nodes.push(osc2);
      });
    });

    var totalDur = chords.length * chordDur + 0.2;
    timer = window.setTimeout(function () { stopCurrent(); }, totalDur * 1000);

    currentSource = {
      stop: function () {
        if (timer) window.clearTimeout(timer);
        nodes.forEach(function (n) { try { n.stop(); } catch (e) {} });
      }
    };
  }

  // Sung vowel: saw at 140 Hz through formant bandpass filters, vowel shifts.
  function playVoice() {
    ensureCtx();
    stopCurrent();
    isPlaying = true;
    voiceBtn.textContent = "Playing vowel…";
    var dest = buildChain(currentMode);
    var t0 = audioCtx.currentTime + 0.05;
    var nodes = [];

    var osc = audioCtx.createOscillator();
    osc.type = "sawtooth"; osc.frequency.value = 140;
    var srcGain = audioCtx.createGain();
    srcGain.gain.value = 0.5;

    // Three formant filters in parallel, summed.
    var formants = [500, 1500, 2500];
    var vowelShift = [1.0, 1.15, 0.85, 1.3]; // vowel changes over time
    var mix = audioCtx.createGain();
    mix.gain.value = 0.9;
    osc.connect(srcGain);
    formants.forEach(function (f0, idx) {
      var bp = audioCtx.createBiquadFilter();
      bp.type = "bandpass"; bp.frequency.value = f0; bp.Q.value = 6;
      var g = audioCtx.createGain();
      g.gain.value = idx === 0 ? 0.5 : 0.35;
      srcGain.connect(bp); bp.connect(g); g.connect(mix);
      // Slow vowel drift.
      vowelShift.forEach(function (mult, vi) {
        bp.frequency.setValueAtTime(f0 * mult, t0 + vi * 0.9);
      });
      nodes.push(bp);
    });
    var outGain = audioCtx.createGain();
    outGain.gain.setValueAtTime(0.0001, t0);
    outGain.gain.exponentialRampToValueAtTime(0.5, t0 + 0.15);
    outGain.gain.setValueAtTime(0.5, t0 + 3.2);
    outGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 3.8);
    mix.connect(outGain); outGain.connect(dest);
    osc.start(t0); osc.stop(t0 + 4.0);
    nodes.push(osc);

    var timer2 = window.setTimeout(function () { stopCurrent(); }, 4200);
    currentSource = {
      stop: function () {
        window.clearTimeout(timer2);
        nodes.forEach(function (n) { try { n.stop(); } catch (e) {} });
      }
    };
  }

  function startScopes() {
    var waveData = new Uint8Array(analyser.fftSize);
    var freqData = new Uint8Array(analyserFreq.frequencyBinCount);
    function frame() {
      requestAnimationFrame(frame);
      // Waveform.
      analyser.getByteTimeDomainData(waveData);
      var w = waveCanvas.width, h = waveCanvas.height;
      waveCtx.clearRect(0, 0, w, h);
      waveCtx.fillStyle = "#0a0e14"; waveCtx.fillRect(0, 0, w, h);
      waveCtx.strokeStyle = "#30363d";
      waveCtx.beginPath(); waveCtx.moveTo(0, h / 2); waveCtx.lineTo(w, h / 2); waveCtx.stroke();
      waveCtx.strokeStyle = "#3fb950";
      waveCtx.lineWidth = 2;
      waveCtx.beginPath();
      var step = Math.ceil(waveData.length / w);
      for (var x = 0; x < w; x++) {
        var v = waveData[x * step] / 128 - 1;
        var y = h / 2 + v * (h * 0.42);
        if (x === 0) waveCtx.moveTo(x, y); else waveCtx.lineTo(x, y);
      }
      waveCtx.stroke();
      waveCtx.lineWidth = 1;
      waveCtx.fillStyle = "#6e7681";
      waveCtx.font = "11px ui-monospace, monospace";
      waveCtx.fillText("Waveform", 10, 16);

      // Spectrogram (frequency bins, log-ish mapping).
      analyserFreq.getByteFrequencyData(freqData);
      var w2 = specCanvas2.width, h2 = specCanvas2.height;
      specCtx2.clearRect(0, 0, w2, h2);
      specCtx2.fillStyle = "#0a0e14"; specCtx2.fillRect(0, 0, w2, h2);
      var bins = freqData.length;
      var barW = w2 / 128;
      for (var i = 0; i < 128; i++) {
        var idx = Math.floor(Math.pow(i / 128, 1.6) * bins * 0.7);
        var val = freqData[idx] / 255;
        var bh = val * (h2 - 24);
        var hue = 210 - val * 180; // blue to orange
        specCtx2.fillStyle = "hsl(" + hue + ", 80%, " + (25 + val * 40) + "%)";
        specCtx2.fillRect(i * barW, h2 - bh - 4, barW - 1, bh);
      }
      specCtx2.fillStyle = "#6e7681";
      specCtx2.font = "11px ui-monospace, monospace";
      specCtx2.fillText("Spectrum (low frequencies left)", 10, 16);
    }
    frame();
  }

  playBtn.addEventListener("click", playMusic);
  voiceBtn.addEventListener("click", playVoice);
  stopBtn.addEventListener("click", stopCurrent);
  modeBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      modeBtns.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      currentMode = btn.getAttribute("data-mode");
      listenWhy.textContent = modeWhy[currentMode] || "";
      // If playing, restart in the new mode so the change is audible immediately.
      if (isPlaying) {
        // Restart whichever source was playing by checking button labels.
        var wasVoice = voiceBtn.textContent.indexOf("Playing") !== -1;
        if (wasVoice) playVoice(); else playMusic();
      }
    });
  });

  /* ============================================================
     LAB 5: Call path animation + quality
     ============================================================ */
  var callCanvas = $("callCanvas");
  var callCtx = callCanvas.getContext("2d");
  var lossRange = $("lossRange"), jitterRange = $("jitterRange");
  var lossOut = $("lossOut"), jitterOut = $("jitterOut");
  var qualityFill = $("qualityFill"), qualityLabel = $("qualityLabel"), qualityNote = $("qualityNote"), callWhy = $("callWhy");

  var packets = [];
  var callRunning = true;
  var pathNodes = [
    { x: 0.08, label: "Hold music", sub: "MP3 loop" },
    { x: 0.30, label: "Encode", sub: "G.711 / G.729" },
    { x: 0.52, label: "Network", sub: "RTP packets" },
    { x: 0.74, label: "Jitter buffer", sub: "20 to 40 ms" },
    { x: 0.93, label: "Phone", sub: "Decode + speaker" }
  ];

  function updateQuality() {
    var loss = parseInt(lossRange.value, 10);
    var jit = parseInt(jitterRange.value, 10);
    lossOut.textContent = loss + "%";
    jitterOut.textContent = jit + " ms";
    // Teaching heuristic: start at 100, subtract loss and jitter penalties.
    var score = 100 - loss * 4 - Math.max(0, (jit - 20)) * 0.5;
    score = clamp(score, 5, 100);
    qualityFill.style.width = score + "%";
    if (score >= 80) {
      qualityFill.style.background = "#3fb950";
      qualityLabel.textContent = "Good";
      qualityNote.textContent = "Low loss and jitter. Speech and music both survive.";
    } else if (score >= 55) {
      qualityFill.style.background = "#d29922";
      qualityLabel.textContent = "Fair";
      qualityNote.textContent = "Speech is still intelligible. Music starts to stutter and warble.";
    } else {
      qualityFill.style.background = "#f85149";
      qualityLabel.textContent = "Poor";
      qualityNote.textContent = "Packets are lost or late. Words break up and music falls apart.";
    }
    if (loss === 0 && jit <= 20) {
      callWhy.textContent = "At 0% loss and low jitter, packets arrive in order and the jitter buffer hides small timing wobbles.";
    } else if (loss >= 10) {
      callWhy.textContent = "At " + loss + "% loss, roughly 1 in " + Math.max(2, Math.round(100 / Math.max(1, loss))) + " packets never arrives. The decoder guesses, and music exposes every guess.";
    } else if (jit >= 60) {
      callWhy.textContent = "At " + jit + " ms jitter, packets arrive so unevenly that the buffer either starves or adds noticeable delay. Music rhythm breaks first.";
    } else {
      callWhy.textContent = "Loss " + loss + "%, jitter " + jit + " ms. Watch the red packets drop and the gaps appear in the stream.";
    }
  }
  [lossRange, jitterRange].forEach(function (el) { el.addEventListener("input", updateQuality); });
  updateQuality();

  function drawCallPath(ts) {
    if (!callRunning) return;
    requestAnimationFrame(drawCallPath);
    var w = callCanvas.width, h = callCanvas.height;
    var padT = 40, padB = 60;
    var y = padT + (h - padT - padB) / 2;
    var padL = 50, padR = 50;

    callCtx.clearRect(0, 0, w, h);
    callCtx.fillStyle = "#0a0e14";
    callCtx.fillRect(0, 0, w, h);

    // Path line.
    callCtx.strokeStyle = "#30363d";
    callCtx.lineWidth = 3;
    callCtx.beginPath();
    callCtx.moveTo(padL, y); callCtx.lineTo(w - padR, y);
    callCtx.stroke();
    callCtx.lineWidth = 1;

    // Nodes.
    pathNodes.forEach(function (n) {
      var x = padL + n.x * (w - padL - padR);
      callCtx.fillStyle = "#161b22";
      callCtx.strokeStyle = "#58a6ff";
      callCtx.lineWidth = 2;
      callCtx.beginPath();
      callCtx.arc(x, y, 22, 0, Math.PI * 2);
      callCtx.fill(); callCtx.stroke();
      callCtx.lineWidth = 1;
      callCtx.fillStyle = "#f0f6fc";
      callCtx.font = "bold 11px sans-serif";
      callCtx.textAlign = "center";
      callCtx.fillText(n.label, x, y + 42);
      callCtx.fillStyle = "#6e7681";
      callCtx.font = "10px ui-monospace, monospace";
      callCtx.fillText(n.sub, x, y + 56);
    });
    callCtx.textAlign = "left";

    // Spawn packets.
    var loss = parseInt(lossRange.value, 10);
    var jit = parseInt(jitterRange.value, 10);
    if (packets.length < 14 && Math.random() < 0.12) {
      var lost = Math.random() * 100 < loss;
      packets.push({ t: 0, lost: lost, speed: 0.006 + Math.random() * 0.004 + jit * 0.00002 });
    }
    // Update and draw packets.
    packets = packets.filter(function (p) { return p.t <= 1.15; });
    packets.forEach(function (p) {
      p.t += p.speed;
      var x = padL + p.t * (w - padL - padR);
      var wobble = reduceMotion ? 0 : Math.sin(ts / 300 + p.t * 20) * (jit / 100) * 6;
      callCtx.fillStyle = p.lost ? "#f85149" : "#3fb950";
      callCtx.beginPath();
      callCtx.arc(x, y + wobble, 6, 0, Math.PI * 2);
      callCtx.fill();
      if (p.lost) {
        callCtx.strokeStyle = "#f85149";
        callCtx.beginPath();
        callCtx.moveTo(x - 9, y + wobble - 9); callCtx.lineTo(x + 9, y + wobble + 9);
        callCtx.moveTo(x + 9, y + wobble - 9); callCtx.lineTo(x - 9, y + wobble + 9);
        callCtx.stroke();
      }
    });

    callCtx.fillStyle = "#6e7681";
    callCtx.font = "11px ui-monospace, monospace";
    callCtx.fillText("Green = delivered packet · Red X = lost packet · Wobble = jitter", padL, h - 12);
  }
  if (!reduceMotion) {
    requestAnimationFrame(drawCallPath);
  } else {
    // Static fallback: draw once.
    callRunning = true;
    drawCallPath(0);
    callRunning = false;
  }

  /* ============================================================
     LAB 6: History chart
     ============================================================ */
  var historyCanvas = $("historyCanvas");
  var historyCtx = historyCanvas.getContext("2d");
  var eraSelect = $("eraSelect"), historyWhy = $("historyWhy");

  var eras = {
    g711:  { lo: 300, hi: 3400,  label: "G.711 narrowband",  why: "G.711 in 1972: 300 to 3400 Hz at 8 kHz sampling. Everything since has been about widening this tunnel." },
    g722:  { lo: 50,  hi: 7000,  label: "G.722 wideband",   why: "G.722 in 1988: 50 to 7000 Hz at 16 kHz sampling. Doubling the top of the tunnel made HD Voice possible." },
    amrwb: { lo: 50,  hi: 7000,  label: "AMR-WB mobile HD", why: "AMR-WB in 2001 brought wideband to mobile networks at much lower bitrates than G.722." },
    opus:  { lo: 20,  hi: 20000, label: "Opus fullband",    why: "Opus in 2012: fullband up to 20 kHz with adaptive bitrate. One codec for speech and music, sized to the network." },
    evs:   { lo: 20,  hi: 20000, label: "EVS fullband",     why: "EVS in 2014: fullband for mobile, with music modes that preserve harmony far better than speech only codecs." }
  };

  function drawHistory() {
    var w = historyCanvas.width, h = historyCanvas.height;
    var padL = 56, padR = 16, padT = 30, padB = 44;
    var plotH = h - padT - padB;
    var era = eras[eraSelect.value];

    historyCtx.clearRect(0, 0, w, h);
    historyCtx.fillStyle = "#0a0e14";
    historyCtx.fillRect(0, 0, w, h);

    historyCtx.strokeStyle = "#21262d";
    historyCtx.fillStyle = "#6e7681";
    historyCtx.font = "11px ui-monospace, monospace";
    historyCtx.textAlign = "center";
    [100, 1000, 10000].forEach(function (f) {
      var x = freqToX(f, w, padL, padR);
      historyCtx.beginPath(); historyCtx.moveTo(x, padT); historyCtx.lineTo(x, padT + plotH); historyCtx.stroke();
      historyCtx.fillText(f >= 1000 ? (f / 1000) + "k" : f + "", x, h - 26);
    });
    historyCtx.textAlign = "left";

    // All eras as faint bars, selected era highlighted.
    var order = ["g711", "g722", "amrwb", "opus", "evs"];
    var rowH = plotH / order.length;
    order.forEach(function (key, idx) {
      var e = eras[key];
      var y0 = padT + idx * rowH + 4;
      var bh = rowH - 10;
      var x0 = freqToX(e.lo, w, padL, padR), x1 = freqToX(e.hi, w, padL, padR);
      var selected = key === eraSelect.value;
      historyCtx.fillStyle = selected ? "rgba(88,166,255,0.85)" : "rgba(88,166,255,0.25)";
      historyCtx.fillRect(x0, y0, x1 - x0, bh);
      historyCtx.fillStyle = selected ? "#f0f6fc" : "#6e7681";
      historyCtx.font = (selected ? "bold " : "") + "11px ui-monospace, monospace";
      historyCtx.fillText(e.label, padL, y0 + bh / 2 + 4);
    });

    historyCtx.fillStyle = "#58a6ff";
    historyCtx.font = "bold 12px ui-monospace, monospace";
    historyCtx.fillText(era.label + ": " + era.lo + " to " + era.hi + " Hz", padL, padT - 10);
    historyWhy.textContent = era.why;
  }
  eraSelect.addEventListener("change", drawHistory);
  drawHistory();

  /* ============================================================
     Quiz
     ============================================================ */
  var quizData = [
    {
      q: "Why does the phone tunnel end near 3400 Hz instead of 4000 Hz?",
      options: [
        "Because 3400 Hz is the highest frequency a speaker can produce.",
        "Because the 4 kHz channel slot needs guard bands, and 8000 Hz sampling sets a 4000 Hz Nyquist ceiling with room for the anti alias filter.",
        "Because music never uses frequencies above 3400 Hz."
      ],
      correct: 1,
      why: "The channel slot is 4000 Hz wide. Guard bands protect neighboring channels, leaving about 300 to 3400 Hz usable. Sampling at 8000 Hz gives a 4000 Hz ceiling, and the anti alias filter needs headroom below it."
    },
    {
      q: "What does mu-law companding do?",
      options: [
        "It removes frequencies above 3400 Hz.",
        "It compresses loud amplitudes and expands quiet ones before quantization, so 8 bits can cover a wide dynamic range for speech.",
        "It converts stereo music into mono."
      ],
      correct: 1,
      why: "Mu-law bends the amplitude scale so quiet sounds get finer quantization steps and loud sounds get coarser ones. Speech benefits. Quiet music under loud passages suffers."
    },
    {
      q: "Why do speech codecs like G.729 mangle music even at the same bitrate where a music codec would sound fine?",
      options: [
        "Because they are broken.",
        "Because they send a model of the vocal tract, pitch, and excitation instead of waveform detail, and music does not fit that model.",
        "Because they only work at 8 kHz sampling."
      ],
      correct: 1,
      why: "G.729 uses linear predictive coding tuned to human speech. It assumes one pitch, one vocal tract, and speech like spectra. Polyphonic music violates every assumption, so the reconstruction warbles."
    },
    {
      q: "Your call uses Opus fullband on both ends but crosses a G.711 gateway. What do you hear?",
      options: [
        "Fullband quality, because both phones support Opus.",
        "Narrowband quality, because the gateway transcodes down to G.711 and the loss is irreversible.",
        "A failed call."
      ],
      correct: 1,
      why: "Transcoding down to the telephone band deletes bass and highs permanently. The phones can only decode what the gateway sends. This lowest common denominator rule is why hold music lags behind modern codecs."
    },
    {
      q: "Which change would most improve hold music quality without changing the phone network?",
      options: [
        "Playing the music louder.",
        "Sending the music over a separate fullband data channel instead of through the voice codec path.",
        "Removing the jitter buffer."
      ],
      correct: 1,
      why: "The voice path forces narrowband speech coding. A separate data channel, such as streaming audio over the data connection, bypasses the tunnel, the sampler, and the speech codec entirely. Many modern hold systems do exactly this."
    }
  ];

  var quizBody = $("quizBody"), quizScore = $("quizScore"), quizWhy = $("quizWhy");
  var quizAnswered = 0, quizCorrect = 0;

  quizData.forEach(function (item, qi) {
    var div = document.createElement("div");
    div.className = "quiz-q";
    var p = document.createElement("p");
    p.innerHTML = "<strong>Q" + (qi + 1) + ".</strong> " + item.q;
    div.appendChild(p);
    var opts = document.createElement("div");
    opts.className = "predict-options";
    item.options.forEach(function (optText, oi) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = optText;
      btn.addEventListener("click", function () {
        if (btn.disabled) return;
        var all = opts.querySelectorAll("button");
        all.forEach(function (b) { b.disabled = true; });
        all[item.correct].classList.add("correct");
        var isCorrect = oi === item.correct;
        if (!isCorrect) btn.classList.add("wrong");
        quizAnswered++;
        if (isCorrect) quizCorrect++;
        quizScore.textContent = "Score: " + quizCorrect + " / " + quizData.length;
        quizWhy.textContent = item.why;
        if (quizAnswered === quizData.length) {
          quizWhy.textContent = "Quiz complete: " + quizCorrect + " of " + quizData.length + " correct. " + item.why;
        }
      });
      opts.appendChild(btn);
    });
    div.appendChild(opts);
    quizBody.appendChild(div);
  });
})();
