/**
 * blear.ui.img-clip
 * @author ydr.me
 * @create 2016年06月04日14:09:36
 */

'use strict';

var UI = require('blear.ui');


var defaults = {
    auto: true,
    ratio: 1,
    width: 200,
    height: 200,
    minWidth: 100,
    minHeight: 100,
    maxWidth: 200,
    maxHeight: 200
};
var ImgClip = UI.extend({
    className: 'ImgClip',
    constructor: function (options) {
        var the = this;

        ImgClip.parent(the);
    }
});


ImgClip.defaults = defaults;
module.exports = ImgClip;
