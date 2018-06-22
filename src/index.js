/**
 * blear.ui.img-clip
 * @author ydr.me
 * @create 2016年06月04日14:09:36
 */

'use strict';

var UI = require('blear.ui');
var loader = require('blear.utils.loader');
var object = require('blear.utils.object');
var access = require('blear.utils.access');
var selector = require('blear.core.selector');
var attribute = require('blear.core.attribute');
var layout = require('blear.core.layout');
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
     * 旋转度数，仅支持0°、90°、180°、270°（即水平、垂直方向）
     * @type Number
     */
    rotation: 0,

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
    minSelectionSize: 10,

    /**
     * 期望裁剪的宽度，高度会等比运算，宽度优先级高于高度
     * @type Number
     */
    expectWidth: 200,

    /**
     * 期望裁剪的高度，宽度会等比运算
     */
    expectHeight: 0
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
     * @param [rotation]
     * @returns {ImgClip}
     */
    changeImage: function (url, rotation) {
        var the = this;
        var args = access.args(arguments);

        if (args.length === 2) {
            the[_options].rotation = rotation || 0;
        }

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
var sole = ImgClip.sole;
var _options = sole();
var _initNode = sole();
var _initEvent = sole();
var _autoCalMaxSelectionSize = sole();
var _calMaxSelectionSize = sole();
var _emptyImage = sole();
var _changeImage = sole();
var _changeMode = sole();
var _changeSelection = sole();
var _parseSelection = sole();
var _imgEl = sole();
var _containerEl = sole();
var _cloneEl = sole();
var _showEl = sole();
var _trackerEl = sole();
var _resizerEl = sole();
var _resizable = sole();
var _resizerDraggable = sole();
var _trackerDraggable = sole();
var _imgDisplaySizes = sole();
var _imgOriginalSizes = sole();
var _selectionLeftTopWidthHeight = sole();
var _showPosition = sole();
var _rotation = sole();
var _transformImgEl = sole();
var proto = ImgClip.prototype;

proto[_initNode] = function () {
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
proto[_calMaxSelectionSize] = function (width, height) {
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

proto[_emptyImage] = function () {
    var the = this;

    attribute.hide(the[_containerEl]);
    the[_cloneEl].src = the[_showEl].src = '';
};

proto[_changeImage] = function (url) {
    var the = this;
    var options = the[_options];
    var rotation = options.rotation || 0;

    options.rotation = options.rotation % 360;

    if (rotation % 90 > 0) {
        return the.emit('error', new Error('仅支持垂直、水平方向旋转'));
    }

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

        var imgDisplayWidth = imgWidth;
        var imgDisplayHeight = imgHeight;
        var marginTop = 0;
        var marginLeft = 0;

        // 水平、垂直交换
        if (rotation === 90 || rotation === 270) {
            imgDisplayWidth = imgHeight;
            imgDisplayHeight = imgWidth;
            marginTop = (imgHeight - imgWidth) / 2;
            marginLeft = (imgWidth - imgHeight) / 2;
        }

        attribute.style(the[_cloneEl], {
            width: imgDisplayWidth,
            height: imgDisplayHeight,
            marginTop: marginTop,
            marginLeft: marginLeft,
            transform: {
                rotate: rotation
            }
        });
        attribute.style(the[_showEl], {
            width: imgDisplayWidth,
            height: imgDisplayHeight,
            marginTop: marginTop,
            marginLeft: marginLeft,
            transform: {
                rotate: rotation
            }
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

proto[_initEvent] = function () {
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
        var containerTop = layout.clientTop(the[_containerEl]) - scrollTop;
        var containerLeft = layout.clientLeft(the[_containerEl]) - scrollLeft;
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
        var deltaX = meta.deltaX;
        var deltaY = meta.deltaY;

        if (deltaX < minSelectionSize && deltaY < minSelectionSize) {
            the[_changeMode](false);
            the.emit('cancelSelection');
        } else {
            the[_resizable].enable();
            the[_resizerDraggable].enable();

            // 不足最小尺寸
            if (deltaX < minSize.width || deltaY < minSize.height) {
                the[_changeSelection](null, [minSize.width, minSize.height]);
            }
            // 纠正选区
            else {
                var displayRatio = deltaX / deltaY;
                var expectRatio = options.ratio;
                var selectWidth;
                var selectHeight;

                if (expectRatio) {
                    if (displayRatio < expectRatio) {
                        selectHeight = Math.min(deltaY, options.maxHeight);
                        selectWidth = selectHeight * expectRatio;
                    } else {
                        selectWidth = Math.min(deltaX, options.maxWidth);
                        selectHeight = selectWidth / expectRatio;
                    }
                } else {
                    selectWidth = deltaX;
                    selectHeight = deltaY;
                }

                the[_changeSelection](null, [selectWidth, selectHeight]);
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

proto[_changeMode] = function (isSelecting) {
    var the = this;

    attribute.style(the[_cloneEl], 'opacity', isSelecting ? 0.6 : 1);
    attribute.style(the[_resizerEl], 'display', isSelecting ? 'block' : 'none');
};

proto[_changeSelection] = function (positions, sizes) {
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

proto[_parseSelection] = function () {
    var the = this;
    var options = the[_options];
    var rotation = options.rotation;
    var expectWidth = options.expectWidth;
    var expectHeight = options.expectHeight;
    var imgOriginalWidth = the[_imgOriginalSizes][0];
    var imgOriginalHeight = the[_imgOriginalSizes][1];
    var displayWidth = the[_imgDisplaySizes][0];
    var displayHeight = the[_imgDisplaySizes][1];
    var selLeft = the[_selectionLeftTopWidthHeight][0];
    var selTop = the[_selectionLeftTopWidthHeight][1];
    var selWidth = the[_selectionLeftTopWidthHeight][2];
    var selHeight = the[_selectionLeftTopWidthHeight][3];
    var ratioX = 1;
    var ratioY = 1;
    var insideRatio = options.ratio;
    var expectRatio = 1;
    var srcLeft = 0;
    var srcTop = 0;
    var srcWidth = 0;
    var srcHeight = 0;
    // 绘制尺寸
    var drawWidth = 0;
    var drawHeight = 0;
    var translateX = 0;
    var translateY = 0;
    var vertical = false;
    var visibleWidth = 0;
    var visibleHeight = 0;

    switch (rotation) {
        case 0:
            ratioX = displayWidth / imgOriginalWidth;
            ratioY = displayHeight / imgOriginalHeight;
            srcWidth = selWidth / ratioX;
            srcHeight = selHeight / ratioY;
            srcLeft = selLeft / ratioX;
            srcTop = selTop / ratioY;
            break;

        case 90:
            ratioX = displayHeight / imgOriginalWidth;
            ratioY = displayWidth / imgOriginalHeight;
            srcWidth = selHeight / ratioX;
            srcHeight = selWidth / ratioY;
            srcLeft = selTop / ratioX;
            srcTop = imgOriginalHeight - selLeft / ratioY - srcHeight;
            vertical = true;
            break;

        case 180:
            ratioX = displayWidth / imgOriginalWidth;
            ratioY = displayHeight / imgOriginalHeight;
            srcWidth = selWidth / ratioX;
            srcHeight = selHeight / ratioY;
            srcLeft = imgOriginalWidth - selLeft / ratioX - srcWidth;
            srcTop = imgOriginalHeight - selTop / ratioY - srcHeight;
            break;

        case 270:
            ratioX = displayHeight / imgOriginalWidth;
            ratioY = displayWidth / imgOriginalHeight;
            srcWidth = selHeight / ratioX;
            srcHeight = selWidth / ratioY;
            srcLeft = imgOriginalWidth - selTop / ratioX - srcWidth;
            srcTop = selLeft / ratioY;
            vertical = true;
            break;
    }

    // 垂直方向，宽高正好颠倒
    if (vertical) {
        expectRatio = insideRatio ? 1 / insideRatio : selHeight / selWidth;

        if (expectWidth) {
            drawHeight = expectWidth;
            drawWidth = drawHeight * expectRatio;
        } else {
            drawWidth = expectHeight;
            drawHeight = drawWidth / expectRatio;
        }

        visibleWidth = drawHeight;
        visibleHeight = drawWidth;
    } else {
        expectRatio = insideRatio ? insideRatio : selWidth / selHeight;

        if (expectWidth) {
            drawWidth = expectWidth;
            drawHeight = drawWidth / expectRatio;
        } else {
            drawHeight = expectHeight;
            drawWidth = drawHeight * expectRatio;
        }

        visibleWidth = drawWidth;
        visibleHeight = drawHeight;
    }

    switch (rotation) {
        case 0:
            break;

        case 90:
            translateX = drawHeight;
            break;

        case 180:
            translateX = drawWidth;
            translateY = drawHeight;
            break;

        case 270:
            translateY = drawWidth;
            break;
    }

    return {
        left: selLeft,
        top: selTop,
        width: selWidth,
        height: selHeight,
        srcLeft: srcLeft,
        srcTop: srcTop,
        srcWidth: srcWidth,
        srcHeight: srcHeight,
        drawWidth: drawWidth,
        drawHeight: drawHeight,
        translateX: translateX,
        translateY: translateY,
        rotation: rotation,
        visibleWidth: visibleWidth,
        visibleHeight: visibleHeight
    };
};

/**
 * 变换图片
 */
proto[_transformImgEl] = function () {
    var the = this;

    attribute.style(the[_imgEl], 'transform', {
        rotate: the[_rotation]
    });
};

style += '.' + namespace + '-line{' +
    /**/'background:#fff url("' + gif + '");' +
    '}';

coolie.importStyle(style);
ImgClip.defaults = defaults;
module.exports = ImgClip;
