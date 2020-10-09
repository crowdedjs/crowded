"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/*
Copyright (c) 2009-2010 Mikko Mononen memon@inside.org
Recast4J Copyright (c) 2015 Piotr Piastucki piotr@jtilia.org

This software is provided 'as-is', without any express or implied
warranty.  In no event will the authors be held liable for any damages
arising from the use of this software.
Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:
1. The origin of this software must not be misrepresented; you must not
 claim that you wrote the original software. If you use this software
 in a product, an acknowledgment in the product documentation would be
 appreciated but is not required.
2. Altered source versions must be plainly marked as such, and must not be
 misrepresented as being the original software.
3. This notice may not be removed or altered from any source distribution.
*/

/**
 * Defines an navigation mesh off-mesh connection within a dtPoly object. An off-mesh connection is a user defined
 * traversable connection made up to two vertices.
 */
var OffMeshConnection = function OffMeshConnection() {
  _classCallCheck(this, OffMeshConnection);

  _defineProperty(this, "pos", new Array(6));

  _defineProperty(this, "rad", 0);

  _defineProperty(this, "poly", 0);

  _defineProperty(this, "flags", 0);

  _defineProperty(this, "side", 0);

  _defineProperty(this, "userId", 0);
};

var _default = OffMeshConnection;
exports["default"] = _default;