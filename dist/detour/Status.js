"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
var Status = /*#__PURE__*/function () {
  function Status(inValue) {
    _classCallCheck(this, Status);

    this.value = inValue;
  }

  _createClass(Status, [{
    key: "isFailed",
    value: function isFailed() {
      return this.value == Status.FAILURE;
    }
  }, {
    key: "isInProgress",
    value: function isInProgress() {
      return this.value == Status.IN_PROGRESS;
    }
  }, {
    key: "isSuccess",
    value: function isSuccess() {
      return this.value == Status.SUCCSESS || this.value == Status.PARTIAL_RESULT;
    }
  }, {
    key: "isPartial",
    value: function isPartial() {
      return this.value == Status.PARTIAL_RESULT;
    }
  }]);

  return Status;
}();

_defineProperty(Status, "FAILURE", 0);

_defineProperty(Status, "SUCCSESS", 1);

_defineProperty(Status, "IN_PROGRESS", 2);

_defineProperty(Status, "PARTIAL_RESULT", 3);

var _default = Status;
exports["default"] = _default;