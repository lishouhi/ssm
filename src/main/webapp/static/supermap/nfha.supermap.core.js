/// <reference path="../jquery.jdirk.js" />

var SupMapLib = window.SupMapLib = SupMapLib || {};

/**
 * 定义常量, 绘制的模式
 * @final {Number} DrawingType
 */
var SUPMAP_DRAWING_MARKER = "marker", // 鼠标画点模式
    SUPMAP_DRAWING_POLYLINE = SuperMap.Handler.Path, // 鼠标画线模式
    SUPMAP_DRAWING_CIRCLE = "circle", // 鼠标画圆模式
    SUPMAP_DRAWING_RECTANGLE = "rectangle", // 鼠标画矩形模式
    SUPMAP_DRAWING_POLYGON = "polygon", // 鼠标画多边形模式
    SUPMAP_DRAWING_CLEAR = "clear"; //清空图层区域模式

(function () {

    /**
     * 声明baidu包
     */
    var supmap = supmap || { };

    (function() {
        /**
         * 将源对象的所有属性拷贝到目标对象中
         * @name baidu.extend
         * @function
         * @grammar baidu.extend(target, source)
         * @param {Object} target 目标对象
         * @param {Object} source 源对象
         * @returns {Object} 目标对象
         */
        supmap.extend = function (target, source) {
            for (var p in source) {
                if (source.hasOwnProperty(p)) {
                    target[p] = source[p];
                }
            }
            return target;
        };

        /**
         * @ignore
         * @namespace
         * @baidu.lang 对语言层面的封装，包括类型判断、模块扩展、继承基类以及对象自定义事件的支持。
         * @property guid 对象的唯一标识
         */
        supmap.lang = supmap.lang || {};

        /**
         * 判断目标参数是否string类型或String对象
         * @name baidu.lang.isString
         * @function
         * @grammar baidu.lang.isString(source)
         * @param {Any} source 目标参数
         * @shortcut isString
         * @meta standard
         *             
         * @returns {boolean} 类型判断结果
         */
        supmap.lang.isString = function (source) {
            return '[object String]' == Object.prototype.toString.call(source);
        };

        /**
         * 判断目标参数是否为function或Function实例
         * @name baidu.lang.isFunction
         * @function
         * @grammar baidu.lang.isFunction(source)
         * @param {Any} source 目标参数
         * @returns {boolean} 类型判断结果
         */
        supmap.lang.isFunction = function (source) {
            return '[object Function]' == Object.prototype.toString.call(source);
        };

    })();

    var nfhaSelf;
    var Nfha = SupMapLib.Nfha = function (map, opts) {
        nfhaSelf = this;

        if (!map) {
            return;
        }
        opts = opts || {};

        this._initialize(map, opts);
    };

    /**
     * 初始化状态
     * @param {Map} 地图实例
     * @param {Object} 参数
     */
    Nfha.prototype._initialize = function (map, opts) {
        /**
         * map对象
         * @private
         * @type {Map}
         */
        this._map = map;

        /**
         * 配置对象
         * @private
         * @type {Object}
         */
        this._opts = opts;

        /**
        * 是否创建指令区
        * @private
        * @type {Boolean}
        */
        this._isLoadCmdLayer = true;
        if (typeof(opts.isLoadCmdLayer)=="boolean") {
            this._isLoadCmdLayer = opts.isLoadCmdLayer;
        }


        /**
        * 是否创建码头区
        * @private
        * @type {Boolean}
        */
        this._isLoadDockLayer = true;
        if (typeof (opts.isLoadDockLayer) == "boolean") {
            this._isLoadDockLayer = opts.isLoadDockLayer;
        }

        /**
        * 是否创建香港区
        * @private
        * @type {Boolean}
        */
        this._isLoadHkLayer = true;
        if (typeof (opts.isLoadHkLayer) == "boolean") {
            this._isLoadHkLayer = opts.isLoadHkLayer;
        }

        /**
        * 是否创建轨迹回放图层
        * @private
        * @type {Boolean}
        */
        this._isLoadPlayBackLayer = true;
        if (typeof (opts.isLoadPlayBackLayer) == "boolean") {
            this._isLoadPlayBackLayer = opts.isLoadPlayBackLayer;
        }

        /**
        * 是否创建在线船舶图Marker层
        * @private
        * @type {Boolean}
        */
        this._isLoadOnlineShipMarkerLayer = true;
        if (typeof (opts.isLoadOnlineShipMarkerLayer) == "boolean") {
            this._isLoadOnlineShipMarkerLayer = opts.isLoadOnlineShipMarkerLayer;
        }
        /**
         * 是否需要进行坐标转换
         * @private
         * @type {Boolean}
         */
        this._isTransform = opts.isTransform || false;

        /**
         * 源投影
         * @private
         * @type {String}
         */
        this._sourceProjection = opts.sourceProjection || 'EPSG:4326';

        /**
         * 目标投影
         * @private
         * @type {String}
         */
        this._destProjection = opts.destProjection || 'EPSG:3857';

        /**
        * 轨迹回放类型是(0:其它业务，1：内外贸同船业务)
        * @private
        * @type {Number}
        */
        this._isInternalForeignTrade = opts.isInternalForeignTrade || 0;

        /**
         * 地图缩放级别
         * @private
         * @type {Number}
         */
        this._currentZoomLevel = this._map.getZoom();

        /**
         * 码头层
         * @private
         * @type {Number}
         */
        if (this._isLoadDockLayer) {
            this._dockLayer = opts.dockLayer || new SuperMap.Layer.Vector("码头");
        } else {
            this._dockLayer = null;
        }

        /**
         * 指令区层
         * @private
         * @type {Number}
         */
        if (this._isLoadCmdLayer) {
            this._cmdLayer = opts.cmdLayer || new SuperMap.Layer.Vector("指令区");
        } else {
            this._cmdLayer = null;
        }

        /**
         * 香港、澳门区域
         * @private
         * @type {Number}
         */
        if (this._isLoadHkLayer) {
            this._hkLayer = opts.hkLayer || new SuperMap.Layer.Vector("香港澳门");
        } else {
            this._hkLayer = null;
        }

        /**
         * 轨迹回放图层
         * @private
         * @type {Number}
         */
        if (this._isLoadPlayBackLayer) {
            this._playBackLayer = opts.playBackLayer || new SuperMap.Layer.Vector("轨迹回放");
        } else {
            this._playBackLayer = null;
        }
        /**
         * 在线船舶marker图层
         * @private
         * @type {Number}
         */
        if (this._isLoadOnlineShipMarkerLayer) {
            this._onlineShipMarkerLayer = opts.onlineShipMarkerLayer || new SuperMap.Layer.Markers("在线船舶");
        } else {
            this._onlineShipMarkerLayer = null;
        }
        /************************************************轨迹回放私有变量(start)****************************************************/

        /**
         * 计时器
         * @private
         * @type {Number}
         */
        this._timer = null;

        /**
         * 当前回放点索引
         * @private
         * @type {Number}
         */
        this._currentPointIndex = 0;

        /**
         * 上一轨迹点
         * @private
         * @type {SuperMap.LonLat}
         */
        this._prevLonLat = null;

        /**
         * 间隔时间(毫秒)
         * @private
         * @type {Number}
         */
        this._interval = 10;

        /**
         * 船舶图标
         * @private
         * @type {String}
         */
        this._shipIcon = '/Content/Image/green.png';

        /************************************************轨迹回放私有变量(end)****************************************************/

        //事件绑定
        this._map.events.on({ "zoomend": this._zoomend });
        this._map.events.on({ "mousemove": this._mousePosition });

        //添加图层
        if (this._cmdLayer) {
            map.addLayer(this._cmdLayer);
        }
        if (this._dockLayer) {
            map.addLayer(this._dockLayer);
        } 
        if (this._hkLayer) {
            map.addLayer(this._hkLayer);
        }
        if (this._playBackLayer) {
            map.addLayer(this._playBackLayer);
        }
        if (this._onlineShipMarkerLayer) {
            map.addLayer(this._onlineShipMarkerLayer);
        }

        //初始化时隐藏码头及境外区域
        this._hideHkArea();
        this._hideDockArea();

        //初始化区域
        this._initArea();
    };

    /**
     * 初始化地图码头、指令区、香港、澳门等区域
     * @private
     */
    Nfha.prototype._initArea = function() {
        $.ajax({
            type: 'GET',
            dataType: 'json',
            cache: false,
            url: '../../Map/GetAllRegionPlate',
            success: function (data) {
                var cmdPolygons = [],
                    dockPolygons = [];
                for (var i = 0; i < data.length; i++) {
                    var item = data[i],
                        linePloygon = { text: '', points: [] },
                        cmdPloygon = { text: '', points: [] },
                        dockPloygon = { text: '', points: [] },
                        coordinatesText = item.CoordinatesText;

                    //先暂时不处理电子围栏
                    if (item.PlateType == 4) {
                        continue;
                    }

                    //画区域(码头、指令区等)
                    var coordinateArr = coordinatesText.split(',');
                    switch (item.PlateType) {
                        case 1:
                            if (nfhaSelf._hkLayer) {
                                linePloygon.text = item.Name;
                                $.each(coordinateArr, function (j, coordinate) {
                                    var lonlatArr = $.trim(coordinate).split(' ');
                                    linePloygon.points.push(nfhaSelf._transform(new SuperMap.Geometry.Point(lonlatArr[0], lonlatArr[1])));
                                });

                                nfhaSelf.drawLine(nfhaSelf._hkLayer, linePloygon.points, {
                                    strokeColor: 'gray',
                                    fill: false,
                                    strokeWidth: 1,
                                    strokeDashstyle: 'longdashdot'
                                });
                            }
                            break;
                        case 2:
                            cmdPloygon.styleOption = {
                                label: item.Name,
                                fontSize: "18px",
                                strokeWidth: 1,
                                strokeColor: '#006696',
                                strokeOpacity: 0.8,
                                fillOpacity: 0.48,
                                fillColor: '#8ED0DE',
                                labelSelect: "true",
                                //fontWeight: 'bold',
                                fontColor: 'black',
                                fontFamily: "微软雅黑"
                            };
                            $.each(coordinateArr, function (j, coordinate) {
                                var lonlatArr = $.trim(coordinate).split(' ');
                                cmdPloygon.points.push(nfhaSelf._transform(new SuperMap.Geometry.Point(lonlatArr[0], lonlatArr[1])));
                            });

                            cmdPolygons.push(cmdPloygon);
                            break;
                        case 3:
                            dockPloygon.styleOption = {
                                label: item.Name,
                                fontSize: "10px",
                                strokeWidth: 2,
                                strokeColor: '#4da6b9',
                                strokeOpacity: 0.6,
                                //fillOpacity: 0.5,
                                fillColor: '#72c9d6',
                                labelSelect: "true",
                                //fontWeight: 'bold',
                                fontColor: 'black',
                                fontFamily: "微软雅黑"
                            };
                            $.each(coordinateArr, function (j, coordinate) {
                                var lonlatArr = $.trim(coordinate).split(' ');
                                dockPloygon.points.push(nfhaSelf._transform(new SuperMap.Geometry.Point(lonlatArr[0], lonlatArr[1])));
                            });

                            dockPolygons.push(dockPloygon);
                            break;
                    }
                }
                if (nfhaSelf._isLoadCmdLayer) {
                    nfhaSelf._drawPolygons(nfhaSelf._cmdLayer, cmdPolygons);
                }
                if (nfhaSelf._isLoadDockLayer) {
                    nfhaSelf._drawPolygons(nfhaSelf._dockLayer, dockPolygons);
                }
            }
        });
    };

    /**
     * 地图缩放事件
     * @private
     */
    Nfha.prototype._zoomend = function () {
        //console.log(arguments);
        nfhaSelf._currentZoomLevel = nfhaSelf._map.getZoom();

        if (nfhaSelf._opts.zoomend && supmap.lang.isFunction(nfhaSelf._opts.zoomend)) {
            nfhaSelf._opts.zoomend();
        }

        //码头的显示和隐藏
        if (nfhaSelf._currentZoomLevel >= 10) {
            nfhaSelf._showDockArea();
        }
        else {
            nfhaSelf._hideDockArea();
        }

        //境外的显示和隐藏
        if (nfhaSelf._currentZoomLevel >= 9) {
            nfhaSelf._showHkArea();
        }
        else {
            nfhaSelf._hideHkArea();
        }

        //指令区的显示和隐藏
        if (nfhaSelf._currentZoomLevel >= 7) {
            nfhaSelf._showCmdArea();
        }
        else {
            nfhaSelf._hideCmdArea();
        }

        //console.log(nfhaSelf._currentZoomLevel);
    };

    /**
     * 地图上鼠标移动事件
     * @private
     */
    Nfha.prototype._mousePosition = function (e) {
        var lonlat = nfhaSelf._map.getLonLatFromPixel(new SuperMap.Pixel(e.clientX, e.clientY));

        if (nfhaSelf._opts.mousePosition && supmap.lang.isFunction(nfhaSelf._opts.mousePosition)) {
            nfhaSelf._opts.mousePosition(nfhaSelf._untransform(lonlat));
        }
    };

    /**
     * 显示码头区域
     * @private
     */
    Nfha.prototype._showDockArea = function () {
        if (nfhaSelf._dockLayer && !nfhaSelf._dockLayer.visibility) {
            nfhaSelf._dockLayer.setVisibility(true);
        }
    };

    /**
     * 隐藏码头区域
     * @private
     */
    Nfha.prototype._hideDockArea = function () {
        if (nfhaSelf._dockLayer && nfhaSelf._dockLayer.visibility) {
            nfhaSelf._dockLayer.setVisibility(false);
        }
    };

    /**
     * 显示境外区域
     * @private
     */
    Nfha.prototype._showHkArea = function () {
        if (nfhaSelf._hkLayer && !nfhaSelf._hkLayer.visibility) {
            nfhaSelf._hkLayer.setVisibility(true);
        }
    };

    /**
     * 隐藏境外区域
     * @private
     */
    Nfha.prototype._hideHkArea = function () {
        if (nfhaSelf._hkLayer && nfhaSelf._hkLayer.visibility) {
            nfhaSelf._hkLayer.setVisibility(false);
        }
    };

    /**
    * 显示指令区区域
    * @private
    */
    Nfha.prototype._showCmdArea = function () {
        if (nfhaSelf._cmdLayer && !nfhaSelf._cmdLayer.visibility) {
            nfhaSelf._cmdLayer.setVisibility(true);
        }
    };

    /**
     * 隐藏指令区区域
     * @private
     */
    Nfha.prototype._hideCmdArea = function () {
        if (nfhaSelf._cmdLayer && nfhaSelf._cmdLayer.visibility) {
            nfhaSelf._cmdLayer.setVisibility(false);
        }
    };

    /**
     * 坐标转换
     * @private
     * @type {Object}
     */
    Nfha.prototype._transform = function(obj) {
        if (!this._isTransform) {
            return obj;
        }

        if (obj && obj.CLASS_NAME && (obj.CLASS_NAME == 'SuperMap.LonLat' || obj.CLASS_NAME == 'SuperMap.Geometry.Point')) {
            //坐标转换
            obj.transform(this._sourceProjection, this._destProjection);
            return obj;
        }

        throw new Error("not a valid SuperMap.LonLat or SuperMap.Geometry.Point object");
    };

    /**
     * 坐标反转换
     * @private
     * @type {Object}
     */
    Nfha.prototype._untransform = function (obj) {
        if (!this._isTransform) {
            return obj;
        }

        if (obj && obj.CLASS_NAME && (obj.CLASS_NAME == 'SuperMap.LonLat' || obj.CLASS_NAME == 'SuperMap.Geometry.Point')) {
            //坐标转换
            obj.transform(this._destProjection, this._sourceProjection);
            return obj;
        }

        throw new Error("not a valid SuperMap.LonLat or SuperMap.Geometry.Point object");
    };

    /**
     * 绘制区域
     * @private
     * @type {SuperMap.Layer.Vector}              layer        区域所在层
     * @type {SuperMap.Geometry.Point数组的数组}  polygons     区域数据(点信息、区域描述、样式)
     */
    Nfha.prototype._drawPolygons = function (layer, polygons) {
        if (!layer) {
            throw new Error("Nfha.drawPolygon:layer is not exists");
        }

        if (!polygons) {
            throw new Error("Nfha.drawPolygon:polygon is not exists");
        }

        if (polygons.length == 0) {
            throw new Error("Nfha.drawPolygon:polygon data is empty");
        }

        var polygonsVectors = [],
            linearRings,
            region,
            polygonVector;

        $.each(polygons, function (j, polygon) {
            linearRings = new SuperMap.Geometry.LinearRing(polygon.points);
            region = new SuperMap.Geometry.Polygon([linearRings]);
            polygonVector = new SuperMap.Feature.Vector(region);
            polygonVector.style = polygon.styleOption;

            polygonsVectors.push(polygonVector);
        });

        layer.addFeatures(polygonsVectors);
    };

    /**
     * 根据点状态获取相关颜色值
     * @private
     * @type {Number}                          positionStatus  GPS点状态
     */
    Nfha.prototype._getColorByPositionStatus = function (positionStatus) {
        var color = 'black';

        if (nfhaSelf.__isInternalForeignTrade == 1) {
            return color;
        }

        switch (positionStatus) {
            case 1:
                color = 'black';
                break;

            case 2:
                //color = 'magenta';
                //break;

            case 3:
                color = 'cyan';
                break;

            case 4:
                color = 'blue';
                break;

            case 5:
                color = 'green';
                break;

            case 6:
                color = 'red';
                break;

            case 7:
                color = 'yellow';
                break;

            default:
                color = 'black';
                break;
        }

        return color;
    };

    /**
     * 在地图上增加marker
     * @public
     * @type {SuperMap.Layer.Markers}          layer         Marker所在层
     * @type {SuperMap.LonLat}                 lonlat        GPS经纬度对象
     * @type {String}                          shipIcon      marker图片路径息
     * @type {Boolean}                         isResetLayer  是否重置此图层
     */
    Nfha.prototype.drawMarker = function (layer, lonlat, shipIcon,isResetLayer) {
        if (!layer) {
            throw new Error("Nfha.drawMarker:layer is not exists");
        }

        if (!lonlat) {
            throw new Error("Nfha.drawMarker:lonlat is not exists");
        }

        if (isResetLayer) {
            layer.clearMarkers();
        }

        var size = new SuperMap.Size(44, 33);
        var offset = new SuperMap.Pixel(-(size.w / 2), -(size.h - 10));

        var icon = new SuperMap.Icon(shipIcon, size, offset);
        var marker = new SuperMap.Marker(lonlat, icon);

        layer.addMarker(marker);
    };

    /**
     * 绘制点
     * @public
     * @type {SuperMap.Layer.Vector}           layer        区域所在层
     * @type {SuperMap.Geometry.Point}         point        点信息
     * @type {Object}                          styleOption  样式配置对象
     */
    Nfha.prototype.drawPoint = function (layer, point, styleOption) {
        if (!layer) {
            throw new Error("Nfha.drawLine:layer is not exists");
        }

        if (!point) {
            throw new Error("Nfha.drawLine:point is not exists");
        }

        var pointVector = new SuperMap.Feature.Vector(point);
        pointVector.style = styleOption || {};

        //添加矢量图形覆盖物
        layer.addFeatures(pointVector);
    };

    /**
     * 绘制线条
     * @public
     * @type {SuperMap.Layer.Vector}           layer        区域所在层
     * @type {SuperMap.Geometry.Point数组}     points       组成线条点数组
     * @type {Object}                          styleOption  样式配置对象
     */
    Nfha.prototype.drawLine = function (layer, points, styleOption) {
        if (!layer) {
            throw new Error("Nfha.drawLine:layer is not exists");
        }

        if (!points) {
            throw new Error("Nfha.drawLine:points is not exists");
        }

        if (points.length == 0) {
            throw new Error("Nfha.drawLine:points is not empty");
        }

        var line = new SuperMap.Geometry.LineString(points);
        var lineVector = new SuperMap.Feature.Vector(line);
        lineVector.style = styleOption;

        //添加矢量图形覆盖物
        layer.addFeatures(lineVector);
    };

    /**
     * 绘制区域
     * @public
     * @type {SuperMap.Layer.Vector}           layer        区域所在层
     * @type {SuperMap.Geometry.Point数组}     points       区域所在层
     * @type {String}                          polygonText  区域文本
     * @type {Object}                          styleOption  样式
     */
    Nfha.prototype.drawPolygon = function (layer, points, polygonText, styleOption) {
        if (!layer) {
            throw new Error("Nfha.drawPolygon:layer is not exists");
        }

        if (!points) {
            throw new Error("Nfha.drawPolygon:polygon is not exists");
        }

        if (points.length == 0) {
            throw new Error("Nfha.drawPolygon:polygon data is empty");
        }

        var linearRings,
            region,
            polygonVector;

        linearRings = new SuperMap.Geometry.LinearRing(points);
        region = new SuperMap.Geometry.Polygon([linearRings]);
        polygonVector = new SuperMap.Feature.Vector(region);

        if (!styleOption) {
            styleOption = {
                label: polygonText
            };
        }
        polygonVector.style = styleOption;
        layer.addFeatures(polygonVector);
    };

    /**
     * 轨迹回放(线-线)
     * @public
     * @type {Array}                           data         GPS点数据
     * @type {Function}                        points       轨迹回放完成执行的回调函数
     */
    Nfha.prototype.mapPlayTrackLL = function(data, fn) {
        var points = [],
            prevPointStatus,
            currentPointStatus;

        $.each(data, function (j, item) {
            if (j == 0) {
                prevPointStatus = currentPointStatus = item.ShipStatus;
                points.push(nfhaSelf._transform(new SuperMap.Geometry.Point(item.Longitude, item.Latitude, item.ShipStatus)));
            }

            if (j > 0) {
                currentPointStatus = item.ShipStatus;

                if (currentPointStatus == prevPointStatus) {
                    points.push(nfhaSelf._transform(new SuperMap.Geometry.Point(item.Longitude, item.Latitude, item.ShipStatus)));
                    prevPointStatus = currentPointStatus;
                }
                else {
                    var len = points.length;
                    if (len > 0) {
                        points.push(nfhaSelf._transform(new SuperMap.Geometry.Point(item.Longitude, item.Latitude, item.ShipStatus)));
                        nfhaSelf.drawLine(nfhaSelf._playBackLayer, points, {
                            strokeColor: nfhaSelf._getColorByPositionStatus(prevPointStatus),
                            fill: false,
                            strokeWidth: 2,
                            strokeDashstyle: 'solid'
                        });
                        points.length = 0;

                        points.push(nfhaSelf._transform(new SuperMap.Geometry.Point(item.Longitude, item.Latitude, item.ShipStatus)));
                        prevPointStatus = currentPointStatus;
                    }
                }

                if (j == (data.length - 1)) {
                    nfhaSelf.drawLine(nfhaSelf._playBackLayer, points, {
                        strokeColor: nfhaSelf._getColorByPositionStatus(prevPointStatus),
                        fill: false,
                        strokeWidth: 2,
                        strokeDashstyle: 'solid'
                    });

                    var currentLonLat = nfhaSelf._transform(new SuperMap.LonLat(item.Longitude, item.Latitude));
                    nfhaSelf.drawMarker(nfhaSelf._onlineShipMarkerLayer,currentLonLat,nfhaSelf._shipIcon,true);

                    var extent = map.getExtent();
                    if (currentLonLat.lon < extent.left ||
                        currentLonLat.lon > extent.right ||
                        currentLonLat.lat < extent.bottom ||
                        currentLonLat.lat > extent.top) {

                        map.setCenter(currentLonLat, nfhaSelf._currentZoomLevel, nfhaSelf._shipIcon, true);
                    }

                    if (supmap.lang.isFunction(fn)) {
                        fn();
                    }
                }
            }
        });
    };

    /**
     * 轨迹回放(点-线-点)
     * @public
     * @type {Array}                           data         GPS点数据
     * @type {Function}                        points       轨迹回放完成执行的回调函数
     */
    Nfha.prototype.mapPlayTrackPLP = function (data, fn) {
        var points = [],
            pointsCount = data.length;

        nfhaSelf._timer = setTimeout(function () {
            try {
                //清空临时数组以释放内存，否则会占用很多内存，导致页面很卡.
                points.length = 0;
                var item = data[nfhaSelf._currentPointIndex],
                    color = nfhaSelf._getColorByPositionStatus(item.ShipStatus),
                    currentLonLat = nfhaSelf._transform(new SuperMap.LonLat(item.Longitude, item.Latitude)),
                    currentPoint = nfhaSelf._transform(new SuperMap.Geometry.Point(item.Longitude, item.Latitude)),
                    previousPoint = nfhaSelf._prevLonLat == null ? null : nfhaSelf._transform(new SuperMap.Geometry.Point(nfhaSelf._prevLonLat.lon, nfhaSelf._prevLonLat.lat));

                //判断当前点是否在可视地图区域内，如果不在则设置当前点为地图中心
                var extent = nfhaSelf._map.getExtent();
                if (currentLonLat.lon < extent.left ||
                    currentLonLat.lon > extent.right ||
                    currentLonLat.lat < extent.bottom ||
                    currentLonLat.lat > extent.top) {

                    nfhaSelf._map.setCenter(currentLonLat, nfhaSelf._currentZoomLevel);
                }

                if (nfhaSelf._currentPointIndex == 0) {
                    nfhaSelf.drawPoint(nfhaSelf._playBackLayer, currentPoint, {
                        fillColor: color,
                        strokeColor: color,
                        pointRadius: 2
                    });

                    //初始化船shipMarker
                    nfhaSelf.drawMarker(nfhaSelf._onlineShipMarkerLayer, currentLonLat, nfhaSelf._shipIcon, true);

                    nfhaSelf._prevLonLat = new SuperMap.LonLat(item.Longitude, item.Latitude);
                    nfhaSelf._currentPointIndex++;

                    nfhaSelf.mapPlayTrackPLP(data);

                } else if (nfhaSelf._currentPointIndex <= pointsCount - 1) {
                    points.push(previousPoint);
                    points.push(currentPoint);

                    nfhaSelf.drawLine(nfhaSelf._playBackLayer, points, {
                        strokeColor: color,
                        fill: false,
                        strokeWidth: 2,
                        strokeDashstyle: 'solid'
                    });

                    if (nfhaSelf._currentPointIndex < pointsCount - 1) {
                        nfhaSelf.drawPoint(nfhaSelf._playBackLayer, currentPoint, {
                            fillColor: color,
                            strokeColor: color,
                            pointRadius: 2
                        });
                    }

                    //初始化船shipMarker
                    nfhaSelf.drawMarker(nfhaSelf._onlineShipMarkerLayer, currentLonLat, nfhaSelf._shipIcon, true);

                    nfhaSelf._prevLonLat = new SuperMap.LonLat(item.Longitude, item.Latitude);
                    nfhaSelf._currentPointIndex++;

                    if (nfhaSelf._currentPointIndex < pointsCount - 1) {
                        nfhaSelf.mapPlayTrackPLP(data);
                    }

                    if (nfhaSelf._currentPointIndex == pointsCount - 1) {
                        clearTimeout(nfhaSelf._timer);

                        if (supmap.lang.isFunction(fn)) {
                            fn();
                        }
                    }
                }

                //清空临时数组以释放内存
                points.length = 0;
            } catch (e) {
                console.log(e);
            }

        }, nfhaSelf._interval);
    };

    
    //画矢量图【线】
    Nfha.prototype.addLineFeature = function (points, color, strokeDashstyle, vectorLayer) {
        if (points.length == 0) {
            return;
        }

        var line = new SuperMap.Geometry.LineString(points);
        var lineVector = new SuperMap.Feature.Vector(line);
        lineVector.style = {
            strokeColor: color,
            fill: false,
            strokeWidth: 3,
            strokeDashstyle: strokeDashstyle || 'solid' //dash、dot、dashot、longdash、longdashdot,solid
        };

        //添加矢量图形覆盖物
        vectorLayer.addFeatures(lineVector);
    };

    /**
     * 绘制扇形
     * @public
     * @type {SuperMap.Layer.Vector}           layer        区域所在层
     * @type {SuperMap.Geometry.Point数组}     points       区域所在层
     * @type {String}                          polygonText  区域文本
     * @type {Object}                          styleOption  样式
     */
    Nfha.prototype.createFanShaped = function (origin, startDistance, endDistance, startAngle, endAngle, sides) {
        // 修正起始角度与结束角度的关系
        if (startAngle > endAngle) {
            endAngle += 360;
        }
        // 计算有效角度
        var r = endAngle - startAngle;

        //var rR = r * Math.PI / (180 * sides);
        var rR2 = r / sides;

        var rotatedAngle, x, y;
        var points = [];
        var startPoint = null;
        if (startDistance!=0) {
            for (var i = 0; i <= sides; ++i) {
                // 当前角度
                rotatedAngle = (startAngle + rR2 * i);
                x = origin.x + (startDistance * Math.cos(rotatedAngle * Math.PI / 180));
                y = origin.y + (startDistance * Math.sin(rotatedAngle * Math.PI / 180));
                //console.log("i=" + i + ", a=" + rotatedAngle + ", x=" + x + ", y=" + y);
                points.push((new SuperMap.Geometry.Point(x, y)));
                if (startPoint == null) {
                    startPoint = points[0];
                }
            }
        }
        else {
            points.push(origin);
            startPoint = origin;
        }

        if (endDistance!=0) {
            for (var i = 0; i <= sides; ++i) {
                rotatedAngle = (endAngle - rR2 * i);
                x = origin.x + (endDistance * Math.cos(rotatedAngle * Math.PI / 180));
                y = origin.y + (endDistance * Math.sin(rotatedAngle * Math.PI / 180));
                //console.log("i=" + i + ", a=" + rotatedAngle + ", x=" + x + ", y=" + y);
                points.push((new SuperMap.Geometry.Point(x, y)));
            }
        } else {
            points.push(origin);
        }


        // 返回起始点
        points.push(startPoint);

        var ring = new SuperMap.Geometry.LinearRing(points);
        var region = new SuperMap.Geometry.Polygon([ring]);
        var pointFeature = new SuperMap.Feature.Vector(region);
        return pointFeature;
    };



    
    Nfha.prototype.createTriangleVector = function (opt) {
        var pointA = nfhaSelf._transform(new SuperMap.Geometry.Point(opt.longitude , opt.latitude ));
        var pointB = nfhaSelf._transform(new SuperMap.Geometry.Point(opt.longitude + opt.pointRadius * 0.0001, opt.latitude - opt.pointRadius * 0.0003));
        var pointC = nfhaSelf._transform(new SuperMap.Geometry.Point(opt.longitude - opt.pointRadius * 0.0001, opt.latitude - opt.pointRadius * 0.0003));
        var linearRings = new SuperMap.Geometry.LinearRing([pointA, pointB, pointC]);
        var region = new SuperMap.Geometry.Polygon([linearRings]);
        if (typeof (opt.course) == "string") opt.course = parseFloat(opt.course);
        if (!isNaN(opt.course)) {
            // rotate 是逆时针，船舶航向是顺时针，所以要转为负数
            region.rotate(-opt.course, pointA);
        }

        var pointFeature = new SuperMap.Feature.Vector(region);

        pointFeature.style = {
            fillColor: opt.fillColor,
            fillOpacity:opt.fillOpacity,
            strokeColor: opt.strokeColor,
            strokeWidth: opt.strokeWidth,
            strokeOpacity:opt.strokeOpacity,
            strokeDashstyle: opt.strokeDashstyle,
            pointRadius: opt.pointRadius,
            rotation: opt.course
        };
        return pointFeature;
    };

    Nfha.prototype.createCircleVector= function (opt) {
        //var pointFeature = new SuperMap.Feature.Vector(opt.point);
        var origin = new SuperMap.Geometry.Point(opt.longitude, opt.latitude);

        var pointFeature = nfhaSelf.createCircle(origin, opt.pointRadius*0.0001, 16, 360);
        pointFeature.style = {
            fillColor: opt.fillColor,
            fillOpacity: opt.fillOpacity,
            strokeColor: opt.strokeColor,
            strokeWidth: opt.strokeWidth,
            strokeOpacity: opt.strokeOpacity,
            strokeDashstyle: opt.strokeDashstyle,
            pointRadius: opt.pointRadius
        };
        return pointFeature;
    };

    // radius 半径长度，以经纬度的度为单位
    // sides  圆形的面数量，小的话，20个面也可以了。画很大时，需要多些面，如256
    // r      圆的填充角度。360为一个满圆，180画一个半圆
    // angel  围绕中心点旋转几何图形。 只能是360，否则不出来。这个说明来之 http://support.supermap.com.cn:8090/iserver/help/html/js/apidoc/files/SuperMap/Geometry/LinearRing-js.html#SuperMap.Geometry.LinearRing.rotate
    Nfha.prototype.createCircle=function (origin, radius, sides, r) {
        var rR = r*Math.PI/(180*sides);
        var rotatedAngle, x, y;
        var points = [];
        for(var i=0; i<sides; ++i) {
            rotatedAngle = rR*i;
            x = origin.x + (radius * Math.cos(rotatedAngle));
            y = origin.y + (radius * Math.sin(rotatedAngle));
            points.push(mapModel.transform(new SuperMap.Geometry.Point(x, y)));
        }
        rotatedAngle = r*Math.PI/180;
        x = origin.x + (radius * Math.cos(rotatedAngle));
        y = origin.y + (radius * Math.sin(rotatedAngle));
        points.push(mapModel.transform(new SuperMap.Geometry.Point(x, y)));

        var ring = new SuperMap.Geometry.LinearRing(points);
        var angel = 360.0;
        ring.rotate(angel, origin);

        var region = new SuperMap.Geometry.Polygon([ring]);
        var pointFeature = new SuperMap.Feature.Vector(region);
        return pointFeature;
    };

    // 转换为海华雷达的坐标系
    // 0度是向上正北，顺时针方向
    Nfha.prototype.transToHaiHuaRadarCoordinate= function (startAngle, endAngle) {
        // 开始角与结束角先反过来
        return [360 - (endAngle - 90), 360 - (startAngle - 90)];
    };
    
    Nfha.prototype.createVectorIcon= function (opt) {
        var geometry = new SuperMap.Geometry.Point(opt.point.x, opt.point.y);

        var pointFeature = new SuperMap.Feature.Vector(geometry);
        pointFeature.style = {
            fillColor: opt.fillColor,
            fillOpacity: opt.fillOpacity,
            strokeColor: opt.strokeColor,
            strokeWidth: opt.strokeWidth,
            strokeOpacity: opt.strokeOpacity,
            strokeDashstyle: opt.strokeDashstyle,
            pointRadius: opt.pointRadius,
            externalGraphic: opt.externalGraphic,
            graphicWidth: opt.graphicWidth,
            graphicHeight: opt.graphicHeight,
            rotation:opt.course,
            name: opt.name
        };

        return pointFeature;
    };

    Nfha.prototype.createPoint = function (opt) {
        var geometry = new SuperMap.Geometry.Point(opt.point.x, opt.point.y);

        var pointFeature = new SuperMap.Feature.Vector(geometry);
        pointFeature.style = {
            fillColor: opt.fillColor,
            fillOpacity: opt.fillOpacity,
            strokeColor: opt.strokeColor,
            strokeWidth: opt.strokeWidth,
            strokeOpacity: opt.strokeOpacity,
            strokeDashstyle: opt.strokeDashstyle,
            pointRadius: opt.pointRadius,
            rotation: opt.course,
            name: opt.name
        };

        return pointFeature;
    };
    Nfha.prototype.createShipVector = function (opt) {
        if (opt.longitude > 180.0 &&  opt.latitude > 90.0) {
            console.error("绘画坐标异常：", opt);
            return null;
        }
        var pointFeature;
        if (opt.drawType == "point") {
            pointFeature = nfhaSelf.createPoint(opt);
        } else {
            if (!opt.fillOpacity) opt.fillOpacity = 1.0;
            if (!opt.strokeOpacity) opt.strokeOpacity = 1.0;
            if (!opt.strokeWidth) opt.strokeWidth = 0.5;
            if (!opt.pointRadius) opt.pointRadius = 2;
            if (!opt.strokeDashstyle) opt.strokeDashstyle = "solid";
            //if (!opt.course) opt.course = 0;

            switch (opt.geometry) {
                case "triangle":
                    pointFeature = nfhaSelf.createTriangleVector(opt);
                    break;
                case "circle":
                default:
                    pointFeature = nfhaSelf.createCircleVector(opt);
                    break;
            }
        }
        pointFeature.ShipId = opt.shipId;
        //pointFeature.ShipName = opt.shipName;
        //pointFeature.ShipMmsi = opt.shipMmsi;
        //pointFeature.VoyageNo = opt.voyageNo;
        pointFeature.Longitude = opt.longitude;
        pointFeature.Latitude = opt.latitude;
        //pointFeature.Type = opt.type;

        return pointFeature;
    };

    //Nfha.prototype.addShipMarker= function (markerlayer, iconUrl, iconSize, longitude, latitude, shipId, shipName, shipMmsi, voyageNo) {
    //    var location = new SuperMap.LonLat(opt.longitude, opt.latitude);

    //    var size = new SuperMap.Size(opt.iconSize, opt.iconSize);
    //    var offset = new SuperMap.Pixel(-(size.w / 2), -(size.h / 2));
    //    var shipIcon = new SuperMap.Icon(opt.iconUrl, size, offset);
    //    var traceMarkerObject = new SuperMap.Marker(transform(location), shipIcon);
    //    traceMarkerObject.shipId = opt.shipId;
    //    traceMarkerObject.shipName = opt.shipName;
    //    traceMarkerObject.shipMmsi = opt.shipMmsi;
    //    traceMarkerObject.voyageNo = opt.voyageNo;
    //    traceMarkerObject.longitude = opt.longitude;
    //    traceMarkerObject.latitude = opt.latitude;
    //    traceMarkerObject.type = opt.type;
    //    opt.markerlayer.addMarker(traceMarkerObject);

    //    return traceMarkerObject;
    //}



    var meDrawingManager;
    /** 
     * @exports DrawingManager as SupMapLib.DrawingManager 绘制图形工具类
     */
    var DrawingManager = SupMapLib.DrawingManager = function(map, opts) {
        if (!map) {
            return;
        }

        opts = opts || {};

        meDrawingManager = this;

        this._initialize(map, opts);
    }

    /**
     * 初始化状态
     * @param {Map} 地图实例
     * @param {Object} 参数
     */
    DrawingManager.prototype._initialize = function(map, opts) {

        /**
         * map对象
         * @private
         * @type {Map}
         */
        this._map = map;

        /**
         * 配置对象
         * @private
         * @type {Object}
         */
        this._opts = opts;

        /**
         * 当前的绘制模式, 默认是绘制点
         * @private
         * @type {DrawingType}
         */
        this._drawingType = opts.drawingMode || SUPMAP_DRAWING_POLYLINE;

        /**
         * 是否已经开启了绘制状态
         * @private
         * @type {Boolean}
         */
        this._isOpen = !!(opts.isOpen === true);
        if (this._isOpen) {
            this._open();
        }

        /**
        * 绘制要素对象
        * @private
        * @type {Boolean}
        */
        this._drawFeature = null;
    }

    /**
     * 开启地图的绘制状态
     * @return {Boolean}，开启绘制状态成功，返回true；否则返回false。
     */
    DrawingManager.prototype._open = function() {

        this._isOpen = true;

        //添加遮罩，所有鼠标操作都在这个遮罩上完成
        if (!this._mask) {
            //新建一个策略并使用在矢量要素图层(vector)上。
            var strategy = new SuperMap.Strategy.GeoText();
            strategy.style = {
                fontColor:"#7a7a7a",
                //fontWeight:"bolder",
                fontSize:"11px",
                fill: true,
                fillColor: "#FFFFFF",
                fillOpacity: 1,
                stroke: true,
                strokeWidth:1,
                strokeColor:"#FF0000",
                strokeDashstyle:'solid',
                labelXOffset:16,
                labelYOffset:-15
            };

            this._mask = new SuperMap.Layer.Vector("图形绘制",{strategies: [strategy]});
            /*this._mask.style = {
                strokeColor: "#304DBE",
                strokeWidth: 2,
                pointerEvents: "visiblePainted",
                fillColor: "#304DBE",
                fillOpacity: 0.8
            };*/
        }

        if (this._drawFeature == null) {
            this._drawFeature = new SuperMap.Control.DrawFeature(this._mask, this._drawingType, { multi: true });
        }

        //添加绘制图层
        this._map.addLayer(this._mask);
        //监听 featureadded 事件，当添加要素时会触发此事件 
        this._drawFeature.events.on({ "featureadded": this._drawCompleted });
        //map上添加控件 
        map.addControl(this._drawFeature);

        //激活绘制
        this._drawFeature.activate();
        //this._setDrawingMode(this._drawingType);
    }

    /**
     * 开启地图的绘制模式
     *
     * @example <b>参考示例：</b><br />
     * myDrawingManagerObject.open();
     */
    DrawingManager.prototype.open = function() {
        // 判断绘制状态是否已经开启
        if (this._isOpen == true) {
            return true;
        }
        this._open();
    }

    /**
     * 清除绘制涂层绘制内容
     *
     * @example <b>参考示例：</b><br />
     * myDrawingManagerObject.clear();
     */
    DrawingManager.prototype.clear = function() {
        // 判断绘制状态是否已经开启
        if (this._mask) {
            this._mask.removeAllFeatures();
        }
    }

    /**
     * 绘制完成事件
     */
    DrawingManager.prototype._drawCompleted = function (drawGeometryArgs) {
        //停止画面控制
        meDrawingManager._drawFeature.deactivate();

        //this._transform()
        //获得图层几何对象
        var geometry = drawGeometryArgs.feature.geometry;

        var pointVector = new SuperMap.Feature.Vector(geometry.getVertices()[0]);
        var pointVector1 = new SuperMap.Feature.Vector(geometry.getVertices()[1]);
        pointVector.style = pointVector1.style = {
            fillColor: 'white',
            strokeColor: 'red',
            pointRadius: 4,
            fontWeight: "bold",
            //label: '起点',
            labelSelect: "true",
            labelXOffset: 20,
            labelYOffset:20
        };

        var geoTextFeatures = [],
            prevPointClone;

        for (var i = 0;i<geometry.getVertices().length;i++) {
            var geoText = null,
                geoTextFeature = null,
                currPoint = geometry.getVertices()[i],
                currPointClone = geometry.getVertices()[i].clone();

            if(i==0){
                geoText = new SuperMap.Geometry.GeoText(currPoint.x, currPoint.y,"起点");
                prevPointClone = currPointClone;
            }
            else{
                var p1 = meDrawingManager._transform(prevPointClone);
                var p2 = meDrawingManager._transform(currPointClone);
                var d = meDrawingManager._getDistance(p1.x,p1.y,p2.x,p2.y);

                geoText = new SuperMap.Geometry.GeoText(currPoint.x, currPoint.y,"总长：" + d + "公里");

                prevPointClone = currPointClone;
            }

            geoTextFeature  = new SuperMap.Feature.Vector(geoText);
            geoTextFeatures.push(geoTextFeature)
        }

        meDrawingManager._mask.addFeatures(geoTextFeatures);

        //var startGeoText = new SuperMap.Geometry.GeoText(geometry.getVertices()[0].x, geometry.getVertices()[0].y,"起点");
        //var startGeoTextFeature = new SuperMap.Feature.Vector(startGeoText);

        //var endGeoText = new SuperMap.Geometry.GeoText(geometry.getVertices()[1].x, geometry.getVertices()[1].y,"终点");
        //var endGeoTextFeature = new SuperMap.Feature.Vector(endGeoText);

        //添加矢量图形覆盖物
        meDrawingManager._mask.addFeatures([pointVector, pointVector1]);
        //meDrawingManager._mask.addFeatures([startGeoTextFeature, endGeoTextFeature]);

        //对MeasureService类型进行判断和赋值，当判断出是LineString时设置MeasureMode.DISTANCE，否则是MeasureMode.AREA
        //myMeasuerService.measureMode = SuperMap.REST.MeasureMode.DISTANCE;
        //myMeasuerService.processAsync(measureParam); //processAsync负责将客户端的量算参数传递到服务端。
    }

    /**
     * 关闭地图的绘制状态
     * @return {Boolean}，关闭绘制状态成功，返回true；否则返回false。
     */
    DrawingManager.prototype._close = function () {

        this._isOpen = false;

        //停止画面控制
        //this._drawFeature.deactivate();

        //if (this._mask) {
        //    this._map.removeLayer(this._mask);
        //}
    }

    /**
     * 设置当前的绘制模式
     * @param {DrawingType}
     */
    DrawingManager.prototype._setDrawingMode = function (drawingType) {

        this._drawingType = drawingType;

        //add by houpf
        if (drawingType == SUPMAP_DRAWING_CLEAR) {
            this._close();

            //this._bindClear();
        }

        /**
         * 开启编辑状态时候才重新进行事件绑定
         */
        if (this._isOpen) {

            //清空之前的自定义事件
            this._mask.__listeners = {};

            switch (drawingType) {
                case SUPMAP_DRAWING_MARKER:
                    //this._bindMarker();
                    break;
                case SUPMAP_DRAWING_CIRCLE:
                    //this._bindCircle();
                    break;
                case SUPMAP_DRAWING_POLYLINE:
                case SUPMAP_DRAWING_POLYGON:
                    //this._bindPolylineOrPolygon();
                    break;
                case SUPMAP_DRAWING_RECTANGLE:
                    //this._bindRectangle();
                    break;
            }
        }
    }

    /**
     * 设置当前的绘制模式，参数DrawingType，为5个可选常量:
     * <br/>SUPMAP_DRAWING_MARKER    画点
     * <br/>SUPMAP_DRAWING_CIRCLE    画圆
     * <br/>SUPMAP_DRAWING_POLYLINE  画线
     * <br/>SUPMAP_DRAWING_POLYGON   画多边形
     * <br/>SUPMAP_DRAWING_RECTANGLE 画矩形
     * @param {DrawingType} DrawingType
     * @return {Boolean} 
     *
     * @example <b>参考示例：</b><br />
     * myDrawingManagerObject.setDrawingMode(SUPMAP_DRAWING_POLYLINE);
     */
    DrawingManager.prototype.setDrawingMode = function (drawingType) {
        //与当前模式不一样时候才进行重新绑定事件
        if (this._drawingType != drawingType) {
            //closeInstanceExcept(this);
            this._setDrawingMode(drawingType);
        }
    }

    /**
     * 将用角度表示的角转换为近似相等的用弧度表示的角
     */
    DrawingManager.prototype._getRad = function(d){
        return d * Math.PI / 180.0;
    }

    /**
     * 谷歌地图计算两个坐标点的距离
     * @param lng1  经度1
     * @param lat1  纬度1
     * @param lng2  经度2
     * @param lat2  纬度2
     * @return 距离（千米）
     */
    DrawingManager.prototype._getDistance = function(lng1,lat1,lng2,lat2){
        var radLat1 = this._getRad(lat1);
        var radLat2 = this._getRad(lat2);

        var a = radLat1 - radLat2;
        var b = this._getRad(lng1) - this._getRad(lng2);

        var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2)
                + Math.cos(radLat1) * Math.cos(radLat2)
                * Math.pow(Math.sin(b / 2), 2)));
        s = s * 6378.137;
        s = Math.round(s * 10000) / 10000;

        return s;
    }

    /**
     * 坐标转换
     * @private
     * @type {Object}
     */
    DrawingManager.prototype._transform = function(obj) {
        if (obj && obj.CLASS_NAME && (obj.CLASS_NAME == 'SuperMap.LonLat' || obj.CLASS_NAME == 'SuperMap.Geometry.Point')) {
            //坐标转换
            obj.transform('EPSG:3857', 'EPSG:4326');
            return obj;
        }

        throw new Error("not a valid SuperMap.LonLat or SuperMap.Geometry.Point object");
    }

})();
