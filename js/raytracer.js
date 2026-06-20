"use strict";

var TYPE_SPHERE = 0

var world = {
  camera: {
    fovx: Math.PI / 4,
	location: [0,0,0],
	depth: 1
  },
  scene: {
    background: [ 0x00, 0x00, 0x00 ]
  },
  objects: [
    { type: TYPE_SPHERE,
	  location: [0,-1.5,-10],
	  color: [0x00, 0xff, 0x00],
	  radius: 1
	},
	{ type: TYPE_SPHERE,
	  location: [0,0,-10],
	  color: [0xff, 0x00, 0x00],
	  radius: .75
	},
	{ type: TYPE_SPHERE,
	  location: [0,1,-10],
	  color: [0x00, 0x00, 0xff],
	  radius: .5
	}
  ],
  lights: [
    {  location: [-2, 2, -6],
	   color: [0xff, 0xf0, 0xee]
	}
  ]
};

var width = 500;
var height = 200;
var res = .35;
var bwidth = ~~(width * res);
var bheight = ~~(height * res);

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

function RayTracer(screenId) {
	var screen = document.getElementById(screenId);	
	var style = screen.style;
	
	style.width = width;
	style.height = height;
	style.background = '#000';
	
	var canvas = document.createElement('canvas');
	canvas.style.width = width;
	canvas.style.height = height;
	canvas.width = bwidth;
	canvas.height = bheight;
	screen.appendChild(canvas);
	
	this.screen = screen;
	this.canvas = canvas;
	this.context = canvas.getContext('2d');
	this.bimg = this.context.getImageData(0,0,bwidth,bheight);
	this.bimgd = this.bimg.data;
	this.buffer = new ArrayBuffer(this.bimgd.length);
	this.buf8 = new Uint8ClampedArray(this.buffer);
	this.data = new Uint32Array(this.buffer);
	
	//Test endian
	this.littleEndian = true;
	this.data[1] = 0x0a0b0c0d;
	if (this.buffer[4] === 0x0a && this.buffer[5] === 0x0b && this.buffer[6] === 0x0c && this.buffer[7] === 0x0d) {
      this.littleEndian = false;
    }
}

RayTracer.prototype.render = function() {
  var ctx = this.context;
  var bimg = this.bimg;
  var bimgd = this.bimgd;
  var data = this.data;
  var color = [0,0,0];
  var i = 0;
  var ray = [0,0,-world.camera.depth];    
  var fovx = world.camera.fovx;
  var fovy = bheight / bwidth * fovx;
  var tanfovx = Math.tan(fovx);
  var tanfovy = Math.tan(fovy);
  var cpos = [0,0,0];
  
  if (this.littleEndian) {
	for (var v = 0; v < bheight; v ++) {
	  for (var u = 0; u < bwidth; u ++) {
	    ray[0] = ((2 * u - bwidth) / bwidth) * tanfovx;
		ray[1] = ((2 * (bheight - v) - bheight) / bheight) * tanfovy;
        trace(cpos, ray, color);
        data[i] =
		  (255 << 24) |
		  (color[2] << 16) |
		  (color[1] << 8) |
		  (color[0])
		  ;
        i ++;
      }
	}
  } else {
  	for (var v = 0; v < bheight; v ++) {
	  for (var u = 0; u < bwidth; u ++) {
	    ray[0] = ((2 * u - bwidth) / bwidth) * tanfovx;
		ray[1] = ((2 * (bheight - v) - bheight) / bheight) * tanfovy;
        trace(cpos, ray, color);
        data[i] =
		  (color[0] << 24) |
		  (color[1] << 16) |
		  (color[2] << 8) |
		  (255)
		  ;
        i ++;
      }
	}
  }
  bimgd.set(this.buf8);
  ctx.putImageData(bimg, 0, 0);  
}

function trace(rayPos, rayDir, color) {
  var nearest = null;
  color[0] = world.scene.background[0];
  color[1] = world.scene.background[1];
  color[2] = world.scene.background[2];
  for (var i = 0; i < world.objects.length; i++) {
    var o = world.objects[i];
	var hit = null;
	
	if (o.type === TYPE_SPHERE) {
	  hit = raySphereIntersect(rayPos, rayDir, o);
	}
	
	if (hit && (nearest === null || hit.dist < nearest.dist)) {
		nearest = hit;		
	}
  }
  if (nearest != null) {
    var light = world.lights[0];
	var lightVec = vec3Subtract(light.location, nearest.object.location);
	vec3Normalize(lightVec);
    var shade = Math.max(0.2, vec3DotProduct(lightVec, nearest.normal));
    color[0] = nearest.object.color[0] * shade;
    color[1] = nearest.object.color[1] * shade;
    color[2] = nearest.object.color[2] * shade;
  }
}

function raySphereIntersect(rayPos, rayDir, sphere) {
  var offset = vec3Subtract(rayPos, sphere.location);  
  var a = vec3DotProduct(rayDir, rayDir);
  var b = 2 * vec3DotProduct(rayDir, offset);
  var c = vec3DotProduct(offset, offset) - sphere.radius * sphere.radius;
  var d = b * b - 4 * a * c;
  
  if (d < 0) { return null; }
  
  var sqrtd = Math.sqrt(d);
  
  var t0 = (-b - sqrtd) / (2 * a);
  var t1 = (-b + sqrtd) / (2 * a);
  
  if (t1 < 0) {
    return false;
  }
  
  var hit = vec3Add(rayPos, vec3Scale(rayDir, t0));  
  var normal = vec3Scale(vec3Subtract(hit, sphere.location), 1 / sphere.radius);
  
  return {
    hitPoint: hit,
	normal: normal,
    dist: (-b - sqrtd),
	object: sphere
  }
}

function vec3Normalize(v) {
  var mag = vec3Mag(v);
  v[0] /= mag;
  v[1] /= mag;
  v[2] /= mag;
}

function vec3Mag(v) {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
}

function vec3Dist(v1, v2) {
  var dx = v2[0] - v1[0];
  var dy = v2[1] - v1[1];
  var dz = v2[2] - v1[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function vec3Clone(v) {
  return [v[0], v[1], v[2]];
}

function vec3Scale(v, s) {
  return [v[0] * s, v[1] * s, v[2] * s];
}

function vec3Add(v1, v2) {
  return [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]];
}

function vec3Subtract(v1, v2) {
  return [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]];
}

function vec3DotProduct(v1, v2) {
  return v1[0] * v2[0]
       + v1[1] * v2[1]
	   + v1[2] * v2[2];
}