"use strict"

module.exports = applyColorMap

var ndarray = require("ndarray")
var ops = require("ndarray-ops")
var colormap = require("colormap")
var cwise = require("cwise")

var doColoring = cwise({
  args: ["array", "array", "array", "array", "array", "scalar", "scalar", "scalar"],
  body: function(out_r, out_g, out_b, out_a, inp, cmap, lo, hi) {
    var idx = ((inp - lo) * (cmap.length-1) / (hi - lo)) | 0
    if(idx < 0) {
      idx = 0
    }
    if(idx > cmap.length - 1) {
      idx = cmap.length - 1
    }
    out_r = cmap[idx][0]
    out_g = cmap[idx][1]
    out_b = cmap[idx][2]
    out_a = int(cmap[idx][3] * 255);
  }
})

function applyColorMap(array, options) {
  options = options || {}
  var lo = -Infinity
  var hi = Infinity
  var alpha = 255;
  if("min" in options) {
    lo = +options.min
  } else {
    lo = ops.inf(array)
  }
  if("max" in options) {
    hi = +options.max
  } else {
    hi = ops.sup(array)
  }
  if("alpha" in options) {
    alpha = +options.alpha;
  }
  var cmap = colormap({
    colormap: options.colormap || "jet",
    nshades: 256,
    format: "rgba"
  })
  var s = 4;
  var out = options.outBuffer || new Uint8Array(array.size * s)
  var out_shape = new Array(array.dimension + 1)
  var out_stride = new Array(array.dimension)
  for (var i=array.dimension-1; i>=0; --i) {
    out_stride[i] = s
    out_shape[i] = array.shape[i]
    s *= array.shape[i]
  }
  out_shape[array.dimension] = 4
  var out_colors = new Array(4)
  for(var i=0; i<4; ++i) {
    out_colors[i] = ndarray(out, array.shape, out_stride, i);
  }
  doColoring(out_colors[0], out_colors[1], out_colors[2], out_colors[3], array, cmap, lo, hi)
  return ndarray(out, out_shape)
}
