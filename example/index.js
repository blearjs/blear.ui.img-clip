/**
 * 文件描述
 * @author ydr.me
 * @create 2016-06-27 17:34
 */


'use strict';


var ImgClip = require('../src/index');

var retEl = document.getElementById('ret');
var changeImageEl = document.getElementById('changeImage');
var randomSelectionEl = document.getElementById('randomSelection');

var ic = window.ic = new ImgClip({
    el: '#demo',
    ratio: 1
});

var randomNumber = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

ic.on('change', function (sel) {
    retEl.innerHTML = JSON.stringify(sel, null, 4);
});

changeImageEl.onclick = function () {
    changeImageEl.disabled = true;
    ic.changeImage('http://att.bbs.duowan.com/forum/201608/19/012109bz44gbng5fpw94mp.jpg');
};


randomSelectionEl.onclick = function () {
    ic.setSelection([
        randomNumber(0, 30),
        randomNumber(0, 30),
        randomNumber(50, 350),
        randomNumber(50, 350)
    ])
};
