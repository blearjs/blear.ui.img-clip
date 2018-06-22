/**
 * 文件描述
 * @author ydr.me
 * @create 2016-06-27 17:34
 */


'use strict';

var attribute = require('blear.core.attribute');

var ImgClip = require('../src/index');

var consoleEl = document.getElementById('console');
var retEl = document.getElementById('ret');
var retImgEl = document.getElementById('retImg');
var changeImageEl = document.getElementById('changeImage');
var randomSelectionEl = document.getElementById('randomSelection');

var ic = window.ic = new ImgClip({
    el: '#demo',
    ratio: 0.618,
    rotation: 90
});

var randomNumber = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

ic.on('changeSelection', function (sel) {
    consoleEl.innerHTML = JSON.stringify(sel, null, 4);
    attribute.style(retEl, {
        width: sel.width,
        height: sel.height
    });
    attribute.style(retImgEl, {
        top: -sel.top,
        left: -sel.left
    });
});

changeImageEl.onclick = function () {
    changeImageEl.disabled = true;
    ic.changeImage(retImgEl.src = 'http://m1.ablwang.com/uploadfile/2017/1014/20171014031816708.jpg');
};

randomSelectionEl.onclick = function () {
    ic.setSelection([
        randomNumber(0, 30),
        randomNumber(0, 30),
        randomNumber(50, 350),
        randomNumber(50, 350)
    ])
};

document.querySelector('#rotate').onclick = function () {
    ic.rotate(90);
};
