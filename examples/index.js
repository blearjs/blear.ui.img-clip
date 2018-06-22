/**
 * 文件描述
 * @author ydr.me
 * @create 2016-06-27 17:34
 */


'use strict';

var attribute = require('blear.core.attribute');
var canvasImg = require('blear.utils.canvas-img');

var ImgClip = require('../src/index');

var consoleEl = document.getElementById('console');
var retEl = document.getElementById('ret');
var retImgEl = document.getElementById('retImg');
var canvasEl = document.getElementById('canvas');
var demoEl = document.getElementById('demo');
var changeImageEl = document.getElementById('changeImage');
var randomSelectionEl = document.getElementById('randomSelection');

var rotation = 270;
var ratio = 0.618;
demoEl.style.transform = 'rotate(' + rotation + 'deg)';
var ic = window.ic = new ImgClip({
    el: '#demo',
    ratio: ratio,
    rotation: rotation,
    expectWidth: 0,
    expectHeight: 200
});

var randomNumber = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

ic.on('changeSelection', function (sel) {
    consoleEl.innerHTML = JSON.stringify(sel, null, 4);
    // attribute.style(retEl, {
    //     width: sel.width,
    //     height: sel.height
    // });
    // attribute.style(retImgEl, {
    //     top: -sel.srcTop,
    //     left: -sel.srcLeft,
    //     transform: {
    //         rotate: sel.rotation
    //     }
    // });
    var ctx = canvasEl.getContext('2d');
    ctx.save();
    canvasEl.width = sel.visibleWidth;
    canvasEl.height = sel.visibleHeight;
    ctx.translate(sel.translateX, sel.translateY);
    ctx.rotate(sel.rotation * Math.PI / 180);
    canvasImg.draw(canvasEl, demoEl, {
        srcLeft: sel.srcLeft,
        srcTop: sel.srcTop,
        srcWidth: sel.srcWidth,
        srcHeight: sel.srcHeight,
        drawWidth: sel.drawWidth,
        drawHeight: sel.drawHeight
    });
    ctx.restore();
});

changeImageEl.onclick = function () {
    changeImageEl.disabled = true;
    ic.changeImage('http://m1.ablwang.com/uploadfile/2017/1014/20171014031816708.jpg');
};

randomSelectionEl.onclick = function () {
    ic.setSelection([
        randomNumber(0, 30),
        randomNumber(0, 30),
        randomNumber(50, 350),
        randomNumber(50, 350)
    ]);
};

document.querySelector('#rotate').onclick = function () {
    ic.rotate(90);
};
