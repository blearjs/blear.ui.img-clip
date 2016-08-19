/**
 * 文件描述
 * @author ydr.me
 * @create 2016-06-27 17:34
 */


'use strict';


var ImgClip = require('../src/index');

var retEl = document.getElementById('ret');
var ret2El = document.getElementById('ret2');
var changeImageEl = document.getElementById('changeImage');

var ic = window.ic = new ImgClip({
    el: '#demo',
    ratio: 1
});

ic.on('change', function (sel) {
    retEl.innerHTML = JSON.stringify(sel, null, 4);
    ret2El.style.width = sel.srcWidth + 'px';
    ret2El.style.height = sel.srcHeight + 'px';
    ret2El.style.backgroundPosition = '-' + sel.srcLeft + 'px -' + sel.srcTop + 'px';
    ret2El.style.backgroundImage = 'url(' + ic.getImage() + ')';
});

changeImageEl.onclick = function () {
    changeImageEl.disabled = true;
    ic.changeImage('http://att.bbs.duowan.com/forum/201608/19/012109bz44gbng5fpw94mp.jpg');
};
