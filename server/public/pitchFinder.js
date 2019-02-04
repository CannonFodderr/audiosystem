(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports = PitchFinder = require('pitchfinder');
// const detectPitch = PitchFinder.DynamicWavelet();
// detectPitch.sampleRate = 48000;
// const frequencies = PitchFinder.frequencies(detectPitch, float32Array);
console.log("pitch finder loaded")
// module.exports = PitchFinder 
},{"pitchfinder":2}],2:[function(require,module,exports){
module.exports = require("./lib");
},{"./lib":7}],3:[function(require,module,exports){
"use strict";

var DEFAULT_MIN_FREQUENCY = 82;
var DEFAULT_MAX_FREQUENCY = 1000;
var DEFAULT_RATIO = 5;
var DEFAULT_SENSITIVITY = 0.1;
var DEFAULT_SAMPLE_RATE = 44100;

module.exports = function () {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


  var sampleRate = config.sampleRate || DEFAULT_SAMPLE_RATE;
  var minFrequency = config.minFrequency || DEFAULT_MIN_FREQUENCY;
  var maxFrequency = config.maxFrequency || DEFAULT_MAX_FREQUENCY;
  var sensitivity = config.sensitivity || DEFAULT_SENSITIVITY;
  var ratio = config.ratio || DEFAULT_RATIO;
  var amd = [];
  var maxPeriod = Math.round(sampleRate / minFrequency + 0.5);
  var minPeriod = Math.round(sampleRate / maxFrequency + 0.5);

  return function AMDFDetector(float32AudioBuffer) {
    "use strict";

    var maxShift = float32AudioBuffer.length;

    var t = 0;
    var minval = Infinity;
    var maxval = -Infinity;
    var frames1 = void 0,
        frames2 = void 0,
        calcSub = void 0,
        i = void 0,
        j = void 0,
        u = void 0,
        aux1 = void 0,
        aux2 = void 0;

    // Find the average magnitude difference for each possible period offset.
    for (i = 0; i < maxShift; i++) {
      if (minPeriod <= i && i <= maxPeriod) {
        for (aux1 = 0, aux2 = i, t = 0, frames1 = [], frames2 = []; aux1 < maxShift - i; t++, aux2++, aux1++) {
          frames1[t] = float32AudioBuffer[aux1];
          frames2[t] = float32AudioBuffer[aux2];
        }

        // Take the difference between these frames.
        var frameLength = frames1.length;
        calcSub = [];
        for (u = 0; u < frameLength; u++) {
          calcSub[u] = frames1[u] - frames2[u];
        }

        // Sum the differences.
        var summation = 0;
        for (u = 0; u < frameLength; u++) {
          summation += Math.abs(calcSub[u]);
        }
        amd[i] = summation;
      }
    }

    for (j = minPeriod; j < maxPeriod; j++) {
      if (amd[j] < minval) minval = amd[j];
      if (amd[j] > maxval) maxval = amd[j];
    }

    var cutoff = Math.round(sensitivity * (maxval - minval) + minval);
    for (j = minPeriod; j <= maxPeriod && amd[j] > cutoff; j++) {}

    var search_length = minPeriod / 2;
    minval = amd[j];
    var minpos = j;
    for (i = j - 1; i < j + search_length && i <= maxPeriod; i++) {
      if (amd[i] < minval) {
        minval = amd[i];
        minpos = i;
      }
    }

    if (Math.round(amd[minpos] * ratio) < maxval) {
      return sampleRate / minpos;
    } else {
      return null;
    }
  };
};
},{}],4:[function(require,module,exports){
"use strict";

var DEFAULT_SAMPLE_RATE = 44100;
var MAX_FLWT_LEVELS = 6;
var MAX_F = 3000;
var DIFFERENCE_LEVELS_N = 3;
var MAXIMA_THRESHOLD_RATIO = 0.75;

module.exports = function () {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


  var sampleRate = config.sampleRate || DEFAULT_SAMPLE_RATE;

  return function DynamicWaveletDetector(float32AudioBuffer) {
    "use strict";

    var mins = [];
    var maxs = [];
    var bufferLength = float32AudioBuffer.length;

    var freq = null;
    var theDC = 0;
    var minValue = 0;
    var maxValue = 0;

    // Compute max amplitude, amplitude threshold, and the DC.
    for (var i = 0; i < bufferLength; i++) {
      var sample = float32AudioBuffer[i];
      theDC = theDC + sample;
      maxValue = Math.max(maxValue, sample);
      minValue = Math.min(minValue, sample);
    }

    theDC /= bufferLength;
    minValue -= theDC;
    maxValue -= theDC;
    var amplitudeMax = maxValue > -1 * minValue ? maxValue : -1 * minValue;
    var amplitudeThreshold = amplitudeMax * MAXIMA_THRESHOLD_RATIO;

    // levels, start without downsampling...
    var curLevel = 0;
    var curModeDistance = -1;
    var curSamNb = float32AudioBuffer.length;
    var delta = void 0,
        nbMaxs = void 0,
        nbMins = void 0;

    // Search:
    while (true) {
      delta = ~~(sampleRate / (Math.pow(2, curLevel) * MAX_F));
      if (curSamNb < 2) break;

      var dv = void 0;
      var previousDV = -1000;
      var lastMinIndex = -1000000;
      var lastMaxIndex = -1000000;
      var findMax = false;
      var findMin = false;

      nbMins = 0;
      nbMaxs = 0;

      for (var _i = 2; _i < curSamNb; _i++) {
        var si = float32AudioBuffer[_i] - theDC;
        var si1 = float32AudioBuffer[_i - 1] - theDC;

        if (si1 <= 0 && si > 0) findMax = true;
        if (si1 >= 0 && si < 0) findMin = true;

        // min or max ?
        dv = si - si1;

        if (previousDV > -1000) {
          if (findMin && previousDV < 0 && dv >= 0) {
            // minimum
            if (Math.abs(si) >= amplitudeThreshold) {
              if (_i > lastMinIndex + delta) {
                mins[nbMins++] = _i;
                lastMinIndex = _i;
                findMin = false;
              }
            }
          }

          if (findMax && previousDV > 0 && dv <= 0) {
            // maximum
            if (Math.abs(si) >= amplitudeThreshold) {
              if (_i > lastMaxIndex + delta) {
                maxs[nbMaxs++] = _i;
                lastMaxIndex = _i;
                findMax = false;
              }
            }
          }
        }
        previousDV = dv;
      }

      if (nbMins === 0 && nbMaxs === 0) {
        // No best distance found!
        break;
      }

      var d = void 0;
      var distances = [];

      for (var _i2 = 0; _i2 < curSamNb; _i2++) {
        distances[_i2] = 0;
      }

      for (var _i3 = 0; _i3 < nbMins; _i3++) {
        for (var j = 1; j < DIFFERENCE_LEVELS_N; j++) {
          if (_i3 + j < nbMins) {
            d = Math.abs(mins[_i3] - mins[_i3 + j]);
            distances[d] += 1;
          }
        }
      }

      var bestDistance = -1;
      var bestValue = -1;

      for (var _i4 = 0; _i4 < curSamNb; _i4++) {
        var summed = 0;
        for (var _j = -1 * delta; _j <= delta; _j++) {
          if (_i4 + _j >= 0 && _i4 + _j < curSamNb) {
            summed += distances[_i4 + _j];
          }
        }

        if (summed === bestValue) {
          if (_i4 === 2 * bestDistance) {
            bestDistance = _i4;
          }
        } else if (summed > bestValue) {
          bestValue = summed;
          bestDistance = _i4;
        }
      }

      // averaging
      var distAvg = 0;
      var nbDists = 0;
      for (var _j2 = -delta; _j2 <= delta; _j2++) {
        if (bestDistance + _j2 >= 0 && bestDistance + _j2 < bufferLength) {
          var nbDist = distances[bestDistance + _j2];
          if (nbDist > 0) {
            nbDists += nbDist;
            distAvg += (bestDistance + _j2) * nbDist;
          }
        }
      }

      // This is our mode distance.
      distAvg /= nbDists;

      // Continue the levels?
      if (curModeDistance > -1) {
        if (Math.abs(distAvg * 2 - curModeDistance) <= 2 * delta) {
          // two consecutive similar mode distances : ok !
          freq = sampleRate / (Math.pow(2, curLevel - 1) * curModeDistance);
          break;
        }
      }

      // not similar, continue next level;
      curModeDistance = distAvg;

      curLevel++;
      if (curLevel >= MAX_FLWT_LEVELS || curSamNb < 2) {
        break;
      }

      //do not modify original audio buffer, make a copy buffer, if
      //downsampling is needed (only once).
      var newFloat32AudioBuffer = float32AudioBuffer.subarray(0);
      if (curSamNb === distances.length) {
        newFloat32AudioBuffer = new Float32Array(curSamNb / 2);
      }
      for (var _i5 = 0; _i5 < curSamNb / 2; _i5++) {
        newFloat32AudioBuffer[_i5] = (float32AudioBuffer[2 * _i5] + float32AudioBuffer[2 * _i5 + 1]) / 2;
      }
      float32AudioBuffer = newFloat32AudioBuffer;
      curSamNb /= 2;
    }

    return freq;
  };
};
},{}],5:[function(require,module,exports){
"use strict";

module.exports = function (config) {

  config = config || {};

  /**
   * The expected size of an audio buffer (in samples).
   */
  var DEFAULT_BUFFER_SIZE = 1024;

  /**
   * Defines the relative size the chosen peak (pitch) has. 0.93 means: choose
   * the first peak that is higher than 93% of the highest peak detected. 93%
   * is the default value used in the Tartini user interface.
   */
  var DEFAULT_CUTOFF = 0.97;

  var DEFAULT_SAMPLE_RATE = 44100;

  /**
   * For performance reasons, peaks below this cutoff are not even considered.
   */
  var SMALL_CUTOFF = 0.5;

  /**
   * Pitch annotations below this threshold are considered invalid, they are
   * ignored.
   */
  var LOWER_PITCH_CUTOFF = 80;

  /**
   * Defines the relative size the chosen peak (pitch) has.
   */
  var cutoff = config.cutoff || DEFAULT_CUTOFF;

  /**
   * The audio sample rate. Most audio has a sample rate of 44.1kHz.
   */
  var sampleRate = config.sampleRate || DEFAULT_SAMPLE_RATE;

  /**
   * Size of the input buffer.
   */
  var bufferSize = config.bufferSize || DEFAULT_BUFFER_SIZE;

  /**
   * Contains a normalized square difference function value for each delay
   * (tau).
   */
  var nsdf = new Float32Array(bufferSize);

  /**
   * The x and y coordinate of the top of the curve (nsdf).
   */
  var turningPointX = void 0;
  var turningPointY = void 0;

  /**
   * A list with minimum and maximum values of the nsdf curve.
   */
  var maxPositions = [];

  /**
   * A list of estimates of the period of the signal (in samples).
   */
  var periodEstimates = [];

  /**
   * A list of estimates of the amplitudes corresponding with the period
   * estimates.
   */
  var ampEstimates = [];

  /**
   * The result of the pitch detection iteration.
   */
  var result = {};

  /**
   * Implements the normalized square difference function. See section 4 (and
   * the explanation before) in the MPM article. This calculation can be
   * optimized by using an FFT. The results should remain the same.
   */
  var normalizedSquareDifference = function normalizedSquareDifference(float32AudioBuffer) {
    for (var tau = 0; tau < float32AudioBuffer.length; tau++) {
      var acf = 0;
      var divisorM = 0;
      for (var i = 0; i < float32AudioBuffer.length - tau; i++) {
        acf += float32AudioBuffer[i] * float32AudioBuffer[i + tau];
        divisorM += float32AudioBuffer[i] * float32AudioBuffer[i] + float32AudioBuffer[i + tau] * float32AudioBuffer[i + tau];
      }
      nsdf[tau] = 2 * acf / divisorM;
    }
  };

  /**
   * Finds the x value corresponding with the peak of a parabola.
   * Interpolates between three consecutive points centered on tau.
   */
  var parabolicInterpolation = function parabolicInterpolation(tau) {
    var nsdfa = nsdf[tau - 1],
        nsdfb = nsdf[tau],
        nsdfc = nsdf[tau + 1],
        bValue = tau,
        bottom = nsdfc + nsdfa - 2 * nsdfb;
    if (bottom === 0) {
      turningPointX = bValue;
      turningPointY = nsdfb;
    } else {
      var delta = nsdfa - nsdfc;
      turningPointX = bValue + delta / (2 * bottom);
      turningPointY = nsdfb - delta * delta / (8 * bottom);
    }
  };

  // Finds the highest value between each pair of positive zero crossings.
  var peakPicking = function peakPicking() {
    var pos = 0;
    var curMaxPos = 0;

    // find the first negative zero crossing.
    while (pos < (nsdf.length - 1) / 3 && nsdf[pos] > 0) {
      pos++;
    }

    // loop over all the values below zero.
    while (pos < nsdf.length - 1 && nsdf[pos] <= 0) {
      pos++;
    }

    // can happen if output[0] is NAN
    if (pos == 0) {
      pos = 1;
    }

    while (pos < nsdf.length - 1) {
      if (nsdf[pos] > nsdf[pos - 1] && nsdf[pos] >= nsdf[pos + 1]) {
        if (curMaxPos == 0) {
          // the first max (between zero crossings)
          curMaxPos = pos;
        } else if (nsdf[pos] > nsdf[curMaxPos]) {
          // a higher max (between the zero crossings)
          curMaxPos = pos;
        }
      }
      pos++;
      // a negative zero crossing
      if (pos < nsdf.length - 1 && nsdf[pos] <= 0) {
        // if there was a maximum add it to the list of maxima
        if (curMaxPos > 0) {
          maxPositions.push(curMaxPos);
          curMaxPos = 0; // clear the maximum position, so we start
          // looking for a new ones
        }
        while (pos < nsdf.length - 1 && nsdf[pos] <= 0) {
          pos++; // loop over all the values below zero
        }
      }
    }
    if (curMaxPos > 0) {
      maxPositions.push(curMaxPos);
    }
  };

  return function (float32AudioBuffer) {

    // 0. Clear old results.
    var pitch = void 0;
    maxPositions = [];
    periodEstimates = [];
    ampEstimates = [];

    // 1. Calculute the normalized square difference for each Tau value.
    normalizedSquareDifference(float32AudioBuffer);
    // 2. Peak picking time: time to pick some peaks.
    peakPicking();

    var highestAmplitude = -Infinity;

    for (var i = 0; i < maxPositions.length; i++) {
      var tau = maxPositions[i];
      // make sure every annotation has a probability attached
      highestAmplitude = Math.max(highestAmplitude, nsdf[tau]);

      if (nsdf[tau] > SMALL_CUTOFF) {
        // calculates turningPointX and Y
        parabolicInterpolation(tau);
        // store the turning points
        ampEstimates.push(turningPointY);
        periodEstimates.push(turningPointX);
        // remember the highest amplitude
        highestAmplitude = Math.max(highestAmplitude, turningPointY);
      }
    }

    if (periodEstimates.length) {
      // use the overall maximum to calculate a cutoff.
      // The cutoff value is based on the highest value and a relative
      // threshold.
      var actualCutoff = cutoff * highestAmplitude;
      var periodIndex = 0;

      for (var _i = 0; _i < ampEstimates.length; _i++) {
        if (ampEstimates[_i] >= actualCutoff) {
          periodIndex = _i;
          break;
        }
      }

      var period = periodEstimates[periodIndex],
          pitchEstimate = sampleRate / period;

      if (pitchEstimate > LOWER_PITCH_CUTOFF) {
        pitch = pitchEstimate;
      } else {
        pitch = -1;
      }
    } else {
      // no pitch detected.
      pitch = -1;
    }

    result.probability = highestAmplitude;
    result.freq = pitch;
    return result;
  };
};
},{}],6:[function(require,module,exports){
"use strict";

/*
  Copyright (C) 2003-2009 Paul Brossier <piem@aubio.org>
  This file is part of aubio.
  aubio is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  aubio is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.
  You should have received a copy of the GNU General Public License
  along with aubio.  If not, see <http://www.gnu.org/licenses/>.
*/

/* This algorithm was developed by A. de Cheveigné and H. Kawahara and
 * published in:
 * 
 * de Cheveigné, A., Kawahara, H. (2002) "YIN, a fundamental frequency
 * estimator for speech and music", J. Acoust. Soc. Am. 111, 1917-1930.  
 *
 * see http://recherche.ircam.fr/equipes/pcm/pub/people/cheveign.html
 */

var DEFAULT_THRESHOLD = 0.10;
var DEFAULT_SAMPLE_RATE = 44100;
var DEFAULT_PROBABILITY_THRESHOLD = 0.1;

module.exports = function () {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


  var threshold = config.threshold || DEFAULT_THRESHOLD;
  var sampleRate = config.sampleRate || DEFAULT_SAMPLE_RATE;
  var probabilityThreshold = config.probabilityThreshold || DEFAULT_PROBABILITY_THRESHOLD;

  return function YINDetector(float32AudioBuffer) {
    "use strict";

    // Set buffer size to the highest power of two below the provided buffer's length.

    var bufferSize = void 0;
    for (bufferSize = 1; bufferSize < float32AudioBuffer.length; bufferSize *= 2) {}
    bufferSize /= 2;

    // Set up the yinBuffer as described in step one of the YIN paper.
    var yinBufferLength = bufferSize / 2;
    var yinBuffer = new Float32Array(yinBufferLength);

    var probability = void 0,
        tau = void 0;

    // Compute the difference function as described in step 2 of the YIN paper.
    for (var t = 0; t < yinBufferLength; t++) {
      yinBuffer[t] = 0;
    }
    for (var _t = 1; _t < yinBufferLength; _t++) {
      for (var i = 0; i < yinBufferLength; i++) {
        var delta = float32AudioBuffer[i] - float32AudioBuffer[i + _t];
        yinBuffer[_t] += delta * delta;
      }
    }

    // Compute the cumulative mean normalized difference as described in step 3 of the paper.
    yinBuffer[0] = 1;
    yinBuffer[1] = 1;
    var runningSum = 0;
    for (var _t2 = 1; _t2 < yinBufferLength; _t2++) {
      runningSum += yinBuffer[_t2];
      yinBuffer[_t2] *= _t2 / runningSum;
    }

    // Compute the absolute threshold as described in step 4 of the paper.
    // Since the first two positions in the array are 1,
    // we can start at the third position.
    for (tau = 2; tau < yinBufferLength; tau++) {
      if (yinBuffer[tau] < threshold) {
        while (tau + 1 < yinBufferLength && yinBuffer[tau + 1] < yinBuffer[tau]) {
          tau++;
        }
        // found tau, exit loop and return
        // store the probability
        // From the YIN paper: The threshold determines the list of
        // candidates admitted to the set, and can be interpreted as the
        // proportion of aperiodic power tolerated
        // within a periodic signal.
        //
        // Since we want the periodicity and and not aperiodicity:
        // periodicity = 1 - aperiodicity
        probability = 1 - yinBuffer[tau];
        break;
      }
    }

    // if no pitch found, return null.
    if (tau == yinBufferLength || yinBuffer[tau] >= threshold) {
      return null;
    }

    // If probability too low, return -1.
    if (probability < probabilityThreshold) {
      return null;
    }

    /**
     * Implements step 5 of the AUBIO_YIN paper. It refines the estimated tau
     * value using parabolic interpolation. This is needed to detect higher
     * frequencies more precisely. See http://fizyka.umk.pl/nrbook/c10-2.pdf and
     * for more background
     * http://fedc.wiwi.hu-berlin.de/xplore/tutorials/xegbohtmlnode62.html
     */
    var betterTau = void 0,
        x0 = void 0,
        x2 = void 0;
    if (tau < 1) {
      x0 = tau;
    } else {
      x0 = tau - 1;
    }
    if (tau + 1 < yinBufferLength) {
      x2 = tau + 1;
    } else {
      x2 = tau;
    }
    if (x0 === tau) {
      if (yinBuffer[tau] <= yinBuffer[x2]) {
        betterTau = tau;
      } else {
        betterTau = x2;
      }
    } else if (x2 === tau) {
      if (yinBuffer[tau] <= yinBuffer[x0]) {
        betterTau = tau;
      } else {
        betterTau = x0;
      }
    } else {
      var s0 = yinBuffer[x0];
      var s1 = yinBuffer[tau];
      var s2 = yinBuffer[x2];
      // fixed AUBIO implementation, thanks to Karl Helgason:
      // (2.0f * s1 - s2 - s0) was incorrectly multiplied with -1
      betterTau = tau + (s2 - s0) / (2 * (2 * s1 - s2 - s0));
    }

    return sampleRate / betterTau;
  };
};
},{}],7:[function(require,module,exports){
"use strict";

var AMDF = require("./detectors/amdf");
var YIN = require("./detectors/yin");
var DynamicWavelet = require("./detectors/dynamic_wavelet");
var Macleod = require("./detectors/macleod");

var frequencies = require("./tools/frequencies");

module.exports = {
  AMDF: AMDF,
  YIN: YIN,
  DynamicWavelet: DynamicWavelet,
  Macleod: Macleod,
  frequencies: frequencies
};
},{"./detectors/amdf":3,"./detectors/dynamic_wavelet":4,"./detectors/macleod":5,"./detectors/yin":6,"./tools/frequencies":8}],8:[function(require,module,exports){
"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var DEFAULT_TEMPO = 120;
var DEFAULT_QUANTIZATION = 4;
var DEFAULT_SAMPLE_RATE = 44100;

function pitchConsensus(detectors, chunk) {
  var pitches = detectors.map(function (fn) {
    return fn(chunk);
  }).filter(Boolean).sort(function (a, b) {
    return a < b ? -1 : 1;
  });

  // In the case of one pitch, return it.
  if (pitches.length === 1) {
    return pitches[0];

    // In the case of two pitches, return the geometric mean if they
    // are close to each other, and the lower pitch otherwise.
  } else if (pitches.length === 2) {
    var _pitches = _slicedToArray(pitches, 2),
        first = _pitches[0],
        second = _pitches[1];

    return first * 2 > second ? Math.sqrt(first * second) : first;

    // In the case of three or more pitches, filter away the extremes
    // if they are very extreme, then take the geometric mean. 
  } else {
    var _first = pitches[0];
    var _second = pitches[1];
    var secondToLast = pitches[pitches.length - 2];
    var last = pitches[pitches.length - 1];

    var filtered1 = _first * 2 > _second ? pitches : pitches.slice(1);
    var filtered2 = secondToLast * 2 > last ? filtered1 : filtered1.slice(0, -1);
    return Math.pow(filtered2.reduce(function (t, p) {
      return t * p;
    }, 1), 1 / filtered2.length);
  }
}

module.exports = function (detector, float32AudioBuffer) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};


  var tempo = options.tempo || DEFAULT_TEMPO;
  var quantization = options.quantization || DEFAULT_QUANTIZATION;
  var sampleRate = options.sampleRate || DEFAULT_SAMPLE_RATE;

  var bufferLength = float32AudioBuffer.length;
  var chunkSize = Math.round(sampleRate * 60 / (quantization * tempo));

  var getPitch = void 0;
  if (Array.isArray(detector)) {
    getPitch = pitchConsensus.bind(null, detector);
  } else {
    getPitch = detector;
  }

  var pitches = [];
  for (var i = 0, max = bufferLength - chunkSize; i <= max; i += chunkSize) {
    var chunk = float32AudioBuffer.slice(i, i + chunkSize);
    var pitch = getPitch(chunk);
    pitches.push(pitch);
  }

  return pitches;
};
},{}]},{},[1]);
