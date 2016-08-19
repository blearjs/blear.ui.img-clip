/**
 * blear.ui.img-clip
 * @author ydr.me
 * @create 2016年06月04日14:09:36
 */

'use strict';

var UI = require('blear.ui');
var loader = require('blear.utils.loader');
var object = require('blear.utils.object');
var selector = require('blear.core.selector');
var attribute = require('blear.core.attribute');
var layout = require('blear.core.layout');
var modification = require('blear.core.modification');
var Resizable = require('blear.classes.resizable');
var Draggable = require('blear.classes.draggable');

var template = require('./template.html');
var style = require('./style.css');
var gif = require('./line.gif', 'file');


var namespace = 'blearui-imgClip';
var defaults = {
    /**
     * 待裁剪的图片
     */
    el: null,

    /**
     * 是否自动选取
     */
    auto: true,

    /**
     * 裁剪比例
     */
    ratio: 1,

    /**
     * 裁剪宽度
     */
    width: 200,

    /**
     * 裁剪高度
     */
    height: 200,

    /**
     * 裁剪最小宽度
     */
    minWidth: 100,

    /**
     * 裁剪最小高度
     */
    minHeight: 100,

    /**
     * 裁剪最大宽度
     */
    maxWidth: 200,

    /**
     * 裁剪最大高度
     */
    maxHeight: 200
};
var ImgClip = UI.extend({
    className: 'ImgClip',
    constructor: function (options) {
        var the = this;

        ImgClip.parent(the);
        the[_options] = object.assign({}, defaults, options);
        the[_initNode]();
    },


    changeImg: function () {

    }
});
var _options = ImgClip.sole();
var _initNode = ImgClip.sole();
var _initEvent = ImgClip.sole();
var _imgEl = ImgClip.sole();
var _cloneEl = ImgClip.sole();
var _showEl = ImgClip.sole();
var _trackerEl = ImgClip.sole();
var _resizerEl = ImgClip.sole();
var _resizable = ImgClip.sole();
var _draggable = ImgClip.sole();
var pro = ImgClip.prototype;

pro[_initNode] = function () {
    var the = this;
    var options = the[_options];
    var imgEl = the[_imgEl] = selector.query(options.el)[0];
    var imgWidth = layout.outerWidth(imgEl);
    var imgHeight = layout.outerHeight(imgEl);
    var containerEl = modification.parse(template);
    var cloneEl = the[_cloneEl] = selector.query('.' + namespace + '-clone', containerEl)[0];
    var showEl = the[_showEl] = selector.query('.' + namespace + '-show', containerEl)[0];
    var trackerEl = the[_trackerEl] = selector.query('.' + namespace + '-tracker', containerEl)[0];
    var resizerEl = the[_resizerEl] = selector.query('.' + namespace + '-resizer', containerEl)[0];

    attribute.style(containerEl, {
        width: imgWidth,
        height: imgHeight
    });

    loader.img(imgEl.src, function (err, _imgEl) {
        if (err) {
            throw new Error('图片加载失败：' + imgEl.src);
        }

        attribute.hide(imgEl);
        modification.insert(containerEl, imgEl, 'afterend');
        cloneEl.src = showEl.src = _imgEl.src;
        the[_resizable] = new Resizable({
            el: resizerEl,
            width: options.width,
            height: options.height,
            minWidth: options.minWidth,
            minHeight: options.minHeight,
            maxWidth: options.maxWidth,
            maxHeight: options.maxHeight,
            ratio: options.ratio
        });
        the[_draggable] = new Draggable({
            containerEl: resizerEl,
            effectedSelector: resizerEl,
            handleSelector: resizerEl,
            shadow: false
        });
        the[_initEvent]();
    });
};

pro[_initEvent] = function () {
    var the = this;

    the[_resizable].on('resizeStart', function () {
        the[_draggable].disable();
    });

    the[_resizable].on('resizeMove', function () {

    });

    the[_resizable].on('resizeStop', function () {
        the[_draggable].enable();
    });

    the[_draggable].on('dragStart', function () {
        the[_resizable].disable();
    });

    the[_draggable].on('dragMove', function () {

    });

    the[_draggable].on('dragStop', function () {
        the[_resizable].enable();
    });
};


style += '.' + namespace + '-line{' +
    /**/'background:#fff url("' + gif + '");' +
    '}';

coolie.importStyle(style);
ImgClip.defaults = defaults;
module.exports = ImgClip;
