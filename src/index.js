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
var event = require('blear.core.event');
var modification = require('blear.core.modification');
var Resizable = require('blear.classes.resizable');
var Draggable = require('blear.classes.draggable');

var template = require('./template.html');
var style = require('./style.css');
var gif = require('./line.gif', 'file|base64');

var win = window;
var namespace = 'blearui-imgClip';
var defaults = {
    /**
     * 待裁剪的图片
     */
    el: null,

    /**
     * 是否自动最大居中选区
     */
    auto: true,

    /**
     * 裁剪比例
     */
    ratio: 1,

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
    maxWidth: 0,

    /**
     * 裁剪最大高度
     */
    maxHeight: 0,

    /**
     * 开始选区的最小值
     */
    minSelectionSize: 10
};
var ImgClip = UI.extend({
    className: 'ImgClip',
    constructor: function (options) {
        var the = this;

        ImgClip.parent(the);
        the[_options] = object.assign({}, defaults, options);
        the[_autoCalMaxSelectionSize] = !the[_options].maxWidth || !the[_options].maxHeight;
        the[_initNode]();
    },


    /**
     * 改变当前裁剪图片的地址
     * @param url
     * @returns {ImgClip}
     */
    changeImage: function (url) {
        var the = this;

        the[_changeImage](url);

        return the;
    },


    /**
     * 获取当前裁剪的图片地址
     * @returns {string}
     */
    getImage: function () {
        return this[_imgEl].src;
    },


    /**
     * 获取当前选区
     * @returns {{left:Number,top:Number,width:Number,height:Number,srcLeft:Number,srcTop:Number,srcWidth:Number,srcHeight:Number}}
     */
    getSelection: function () {
        return this[_parseSelection]();
    },


    /**
     * 设置选区
     * @param sel {Array} 选区，格式要求：[left, top, width, height]
     * @returns {ImgClip}
     */
    setSelection: function (sel) {
        var the = this;

        the[_changeMode](true);
        the[_changeSelection]([sel[0], sel[1]], [sel[2], sel[3]]);
        the[_resizable].enable();
        the[_resizerDraggable].enable();
        the.emit('afterSelection');

        return this;
    },


    /**
     * 释放选区
     * @returns {ImgClip}
     */
    release: function () {
        var the = this;

        the[_changeMode](false);
        the[_selectionLeftTopWidthHeight] = [0, 0, 0, 0];
        the.emit('changeSelection', the[_parseSelection]());
        the.emit('cancelSelection');

        return the;
    },


    /**
     * 重置为初始状态
     * @returns {ImgClip}
     */
    reset: function () {
        var the = this;

        the.release();
        the[_emptyImage]();

        return the;
    },



    /**
     * 销毁实例
     */
    destroy: function () {
        var the = this;

        the.release();

        if (the[_resizable]) {
            the[_resizable].destroy();
            the[_resizerDraggable].destroy();
            the[_trackerDraggable].destroy();
            the[_resizable] = the[_resizerDraggable] = the[_trackerDraggable] = null;
        }

        modification.remove(the[_containerEl]);
        attribute.show(the[_imgEl]);
    }
});
var _options = ImgClip.sole();
var _initNode = ImgClip.sole();
var _initEvent = ImgClip.sole();
var _autoCalMaxSelectionSize = ImgClip.sole();
var _calMaxSelectionSize = ImgClip.sole();
var _emptyImage = ImgClip.sole();
var _changeImage = ImgClip.sole();
var _changeMode = ImgClip.sole();
var _changeSelection = ImgClip.sole();
var _parseSelection = ImgClip.sole();
var _imgEl = ImgClip.sole();
var _containerEl = ImgClip.sole();
var _cloneEl = ImgClip.sole();
var _showEl = ImgClip.sole();
var _trackerEl = ImgClip.sole();
var _resizerEl = ImgClip.sole();
var _resizable = ImgClip.sole();
var _resizerDraggable = ImgClip.sole();
var _trackerDraggable = ImgClip.sole();
var _imgDisplaySizes = ImgClip.sole();
var _imgOriginalSizes = ImgClip.sole();
var _selectionLeftTopWidthHeight = ImgClip.sole();
var _showPosition = ImgClip.sole();
var pro = ImgClip.prototype;

pro[_initNode] = function () {
    var the = this;
    var options = the[_options];
    var imgEl = the[_imgEl] = selector.query(options.el)[0];
    var containerEl = the[_containerEl] = modification.parse(template);

    the[_cloneEl] = selector.query('.' + namespace + '-clone', containerEl)[0];
    the[_showEl] = selector.query('.' + namespace + '-show', containerEl)[0];
    the[_trackerEl] = selector.query('.' + namespace + '-tracker', containerEl)[0];
    the[_resizerEl] = selector.query('.' + namespace + '-resizer', containerEl)[0];
    the[_changeImage](imgEl.src);
};

// 重新计算最大值
pro[_calMaxSelectionSize] = function (width, height) {
    var the = this;
    var options = the[_options];
    var optionRatio = options.ratio;

    if (optionRatio) {
        if (the[_autoCalMaxSelectionSize]) {
            if (width / height > optionRatio) {
                options.maxHeight = height;
                options.maxWidth = height * optionRatio;
            } else {
                options.maxWidth = width;
                options.maxHeight = width / optionRatio;
            }
        }
    } else {
        options.maxWidth = options.maxWidth || width;
        options.maxHeight = options.maxHeight || height;
    }
};

pro[_emptyImage] = function () {
    var the = this;

    attribute.hide(the[_containerEl]);
    the[_cloneEl].src = the[_showEl].src = '';
};

pro[_changeImage] = function (url) {
    var the = this;
    var options = the[_options];

    the.emit('beforeLoading');
    attribute.show(the[_imgEl], 'inline-block');
    the[_emptyImage]();
    loader.img(url, function (err, originalImg) {
        the.emit('afterLoading');

        if (err) {
            return the.emit('error', err);
        }

        the[_imgEl].src = the[_cloneEl].src = the[_showEl].src = originalImg.src;
        attribute.show(the[_containerEl], 'inline-block');

        var imgWidth = layout.outerWidth(the[_imgEl]);
        var imgHeight = layout.outerHeight(the[_imgEl]);

        attribute.hide(the[_imgEl]);
        the[_showPosition] = the[_selectionLeftTopWidthHeight] = [0, 0, 0, 0];
        the[_imgDisplaySizes] = [imgWidth, imgHeight];
        the[_imgOriginalSizes] = [originalImg.width, originalImg.height];
        the.release();
        the[_calMaxSelectionSize](imgWidth, imgHeight);
        the.emit('changeSelection', the[_parseSelection]());

        attribute.style(the[_containerEl], {
            width: imgWidth,
            height: imgHeight
        });
        attribute.style(the[_cloneEl], {
            width: imgWidth,
            height: imgHeight
        });
        attribute.style(the[_showEl], {
            width: imgWidth,
            height: imgHeight
        });

        if (the[_resizable]) {
            the[_resizable].setOptions({
                maxWidth: options.maxWidth,
                maxHeight: options.maxHeight
            });
        } else {
            modification.insert(the[_containerEl], the[_imgEl], 'afterend');
            the[_resizable] = new Resizable({
                el: the[_resizerEl],
                minWidth: options.minWidth,
                minHeight: options.minHeight,
                maxWidth: options.maxWidth,
                maxHeight: options.maxHeight,
                ratio: options.ratio,
                resizable: false
            });
            the[_resizerDraggable] = new Draggable({
                containerEl: the[_resizerEl],
                effectedSelector: the[_resizerEl],
                handleSelector: the[_resizerEl],
                shadow: false,
                draggable: false
            });
            the[_trackerDraggable] = new Draggable({
                containerEl: the[_trackerEl],
                effectedSelector: the[_trackerEl],
                handleSelector: the[_trackerEl],
                shadow: false,
                draggable: false
            });
            the[_initEvent]();
        }

        // 自动最大居中选区
        if (options.auto) {
            var maxSize = the[_resizable].getMaxSize();
            var maxWidth = maxSize.width;
            var maxHeight = maxSize.height;
            var maxLeft = (imgWidth - maxWidth) / 2;
            var maxTop = (imgHeight - maxHeight) / 2;

            the.setSelection([maxLeft, maxTop, maxWidth, maxHeight]);
        }
    });
};

pro[_initEvent] = function () {
    var the = this;
    var options = the[_options];

    // 尺寸区尺寸改变
    the[_resizable].on('resizeStart', function () {
        the[_resizerDraggable].disable();
        the.emit('beforeSelection');
    });

    the[_resizable].on('resizeMove', function (meta) {
        the[_changeSelection](null, [meta.width, meta.height]);
    });

    the[_resizable].on('resizeEnd', function () {
        the[_resizerDraggable].enable();
        the.emit('afterSelection');
    });

    // 背景拖拽
    the[_trackerDraggable].on('dragStart', function (meta) {
        the[_resizable].disable();
        the[_resizerDraggable].disable();
        the[_selectionLeftTopWidthHeight][2] = the[_selectionLeftTopWidthHeight][3] = 0;
        the[_changeMode](true);

        var scrollTop = layout.scrollTop(win);
        var scrollLeft = layout.scrollLeft(win);
        var containerTop = layout.offsetTop(the[_containerEl]) - scrollTop;
        var containerLeft = layout.offsetLeft(the[_containerEl]) - scrollLeft;
        var styleLeft = meta.startX - containerLeft;
        var styleTop = meta.startY - containerTop;

        the.emit('beforeSelection');
        the[_changeSelection]([styleLeft, styleTop]);
    });

    the[_trackerDraggable].on('dragMove', function (meta) {
        the[_changeSelection](null, [meta.deltaX, meta.deltaY]);
    });

    the[_trackerDraggable].on('dragEnd', function (meta) {
        var minSize = the[_resizable].getMinSize();
        var minSelectionSize = options.minSelectionSize;

        if (meta.deltaX < minSelectionSize && meta.deltaY < minSelectionSize) {
            the[_changeMode](false);
            the.emit('cancelSelection');
        } else {
            the[_resizable].enable();
            the[_resizerDraggable].enable();

            // 不足最小尺寸
            if (meta.deltaX < minSize.width || meta.deltaY < minSize.height) {
                the[_changeSelection](null, [minSize.width, minSize.height]);
            }
            // 纠正选区
            else {
                var maxSize = Math.max(meta.deltaX, meta.deltaY);
                the[_changeSelection](null, [maxSize, maxSize]);
            }

            the.emit('afterSelection');
        }
    });

    // 尺寸区拖拽
    var selectionLeft = 0;
    var selectionTop = 0;
    the[_resizerDraggable].on('dragStart', function () {
        the[_resizable].disable();
        selectionLeft = the[_selectionLeftTopWidthHeight][0];
        selectionTop = the[_selectionLeftTopWidthHeight][1];
        the.emit('beforeSelection');
    });

    the[_resizerDraggable].on('dragMove', function (meta) {
        attribute.style(the[_showEl], {
            left: the[_showPosition][0] - meta.deltaX,
            top: the[_showPosition][1] - meta.deltaY
        });
        the[_changeSelection]([
            selectionLeft + meta.deltaX,
            selectionTop + meta.deltaY
        ]);
    });

    the[_resizerDraggable].on('dragEnd', function (meta) {
        the[_resizable].enable();
        the[_showPosition][0] -= meta.deltaX;
        the[_showPosition][1] -= meta.deltaY;
        // the[_selectionLeftTopWidthHeight][0] = selectionLeft + meta.deltaX;
        // the[_selectionLeftTopWidthHeight][1] = selectionTop + meta.deltaY;
        the.emit('afterSelection');
    });
};

pro[_changeMode] = function (isSelecting) {
    var the = this;

    attribute.style(the[_cloneEl], 'opacity', isSelecting ? 0.6 : 1);
    attribute.style(the[_resizerEl], 'display', isSelecting ? 'block' : 'none');
};

pro[_changeSelection] = function (positions, sizes) {
    var the = this;
    var left = positions ? positions[0] : the[_selectionLeftTopWidthHeight][0];
    var top = positions ? positions[1] : the[_selectionLeftTopWidthHeight][1];
    var width = sizes ? sizes[0] : the[_selectionLeftTopWidthHeight][2];
    var height = sizes ? sizes[1] : the[_selectionLeftTopWidthHeight][3];
    // var minSize = the[_resizable].getMinSize();
    var maxSize = the[_resizable].getMaxSize();
    var maxWidth = maxSize.width;
    var maxHeight = maxSize.height;

    left = Math.max(left, 0);
    top = Math.max(top, 0);
    width = Math.min(width, maxWidth);
    height = Math.min(height, maxHeight);

    if (left + width > the[_imgDisplaySizes][0]) {
        left = the[_imgDisplaySizes][0] - width;
    }

    if (top + height > the[_imgDisplaySizes][1]) {
        top = the[_imgDisplaySizes][1] - height;
    }

    the[_selectionLeftTopWidthHeight] = [left, top, width, height];
    the.emit('changeSelection', the[_parseSelection]());

    attribute.style(the[_resizerEl], {
        left: left,
        top: top,
        width: width,
        height: height
    });
    attribute.style(the[_showEl], {
        left: the[_showPosition][0] = -left,
        top: the[_showPosition][1] = -top
    });
};

pro[_parseSelection] = function () {
    var the = this;
    var ratioX = the[_imgDisplaySizes][0] / the[_imgOriginalSizes][0];
    var ratioY = the[_imgDisplaySizes][1] / the[_imgOriginalSizes][1];

    return {
        left: the[_selectionLeftTopWidthHeight][0],
        top: the[_selectionLeftTopWidthHeight][1],
        width: the[_selectionLeftTopWidthHeight][2],
        height: the[_selectionLeftTopWidthHeight][3],
        srcLeft: the[_selectionLeftTopWidthHeight][0] / ratioX,
        srcTop: the[_selectionLeftTopWidthHeight][1] / ratioY,
        srcWidth: the[_selectionLeftTopWidthHeight][2] / ratioX,
        srcHeight: the[_selectionLeftTopWidthHeight][3] / ratioY
    };
};

style += '.' + namespace + '-line{' +
    /**/'background:#fff url("' + gif + '");' +
    '}';

coolie.importStyle(style);
ImgClip.defaults = defaults;
module.exports = ImgClip;
