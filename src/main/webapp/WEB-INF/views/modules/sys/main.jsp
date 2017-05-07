<%--
  Created by IntelliJ IDEA.
  User: Administrator
  Date: 2017/4/26
  Time: 17:34
  To change this template use File | Settings | File Templates.
--%>
<%@ include file="/WEB-INF/views/include/taglib.jsp" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>

<html>
<head>
    <title>首页</title>
    <script src="${ctxStatic}/js/jquery.min.js"></script>
    <script src="${ctxStaticMap}/libs/SuperMap.Include.js" type="text/javascript"></script>
    <script src="${ctxStaticMap}/nfha.supermap.core.js" type="text/javascript"></script>

    <link href="${ctxStaticRoot}/maptoolbar/index_98a4774.css" rel="stylesheet" />
    <link href="${ctxStaticRoot}/maptoolbar/index_body.css" rel="stylesheet" />

    <script type="text/javascript" src="${ctxStaticRoot}/maptoolbar/toolbarMgr.js"></script>

    <style type="text/css">
        html {
            min-height: 100%;
            height: 100%;
        }

        body {
            margin: 0;
            overflow: hidden;
            background: #fff;
            min-height: 100%;
            height: 100%;
        }

        #map {
            position: relative;
            height: 100%;
        }
    </style>
    <script type="text/javascript">
        /****************************地图相关全局变量****************************/
        var map,
            layer,
            url = 'http://61.145.114.7:8090/iserver/services/map-mbtiles-GuangDong17/rest/maps/广东17',
            overviewmap, //鹰眼控件实例
            panzoombar, //平移缩放控件实例
            scaleline, //比例尺控件实例
            drawLine,
            lineLayer,
            isTransform = true, //是否需要进行坐标转换
            sourceProjection = 'EPSG:3857',
            destProjection = 'EPSG:4326',
            drawManage = null;

        //页面初始化
        $(function() {
            init();
        });

        //创建地图控件
        function init() {
            map = new SuperMap.Map("map", {
                controls: [
                    new SuperMap.Control.Navigation({
                        dragPanOptions: {
                            enableKinetic: true
                        }
                    })
                ]
            });

            //map.minScale = 0.4;
            map.numZoomLevels = 18;

            //初始化复杂缩放控件类
            panzoombar = new SuperMap.Control.PanZoomBar();
            // 是否固定缩放级别为[0,16]之间的整数，默认为false
            panzoombar.forceFixedZoomLevel = true;
            //是否显示滑动条，默认值为false
            panzoombar.showSlider = true;
            /*点击箭头移动地图时，所移动的距离占总距离（上下移动的总距离为高度，左右移动的总距离为宽度）
             的百分比，默认为null。 例如：如果slideRatio 设为0.5, 则垂直上移地图半个地图高度.*/
            panzoombar.slideRatio = 0.5;
            //设置缩放条滑块的高度，默认为11
            panzoombar.zoomStopHeight = 5;
            //设置缩放条滑块的宽度，默认为13
            panzoombar.zoomStopWidth = 9;

            overviewmap = new SuperMap.Control.OverviewMap();
            //属性minRectSize：鹰眼范围矩形边框的最小的宽度和高度。默认为8pixels
            overviewmap.minRectSize = 20;

            scaleline = new SuperMap.Control.ScaleLine();
            //是否使用依地量算，默认为false。推荐地图投影为EPSG:4326时设置为false；使用EPSG:900913时设置为true。为true时，比例值按照当前视图中心的水平线计算。
            scaleline.geodesic = true;

            var mousePosition = new SuperMap.Control.MousePosition();

            //map.addControls([panzoombar, overviewmap, scaleline, mousePosition]);
            map.addControls([panzoombar, overviewmap, scaleline]);
            //map.events.on({ "mousemove": getMousePositionPx });
            map.events.on({ "zoomend": zoomend });

            //创建分块动态REST图层，该图层显示iserver 7C 服务发布的地图,
            //其中"world"为图层名称，url图层的服务地址，{transparent: true}设置到url的可选参数
            layer = new SuperMap.Layer.TiledDynamicRESTLayer("", url,
                null, { maxResolution: "auto" });

            layer.events.on({ "layerInitialized": addLayer });

            //新建线矢量图层
            lineLayer = new SuperMap.Layer.Vector("lineLayer");
            lineLayer.style = {
                strokeColor: "#304DBE",
                strokeWidth: 2,
                pointerEvents: "visiblePainted",
                fillColor: "#304DBE",
                fillOpacity: 0.8
            };

            //创建画线控制，图层是lineLayer;这里DrawFeature(图层,类型,属性)；multi:true在将要素放入图层之前是否现将其放入几何图层中
            drawLine = new SuperMap.Control.DrawFeature(lineLayer, SuperMap.Handler.Path, { multi: true });
            drawLine.events.on({"featureadded": drawCompleted});

            //vectorLayer = new SuperMap.Layer.Vector();
            //markerlayer = new SuperMap.Layer.Markers("markerLayer");
        }

        $(function () {
            // 地图初始化
            var toolbars = [
                // 雷达选择
                new ToolbarMgrPkg({ container: "#ui3_city_change", boxopt: ".boxopt", popup: ".map_popup" }),
                // 工具
                new ToolbarMgrPkg({ container: "#toolbar1", boxopt: ".boxopt", popup: ".detail-box" }),
                // 用户
                new ToolbarMgrPkg({ container: "#user-center", boxopt: ".avatar-abstract", popup: ".info-box" })];

            // 地图初始化
            for (e in toolbars) {
                toolbars[e].bind();
            }

            drawManage = new SupMapLib.DrawingManager(map, { drawingMode: SUPMAP_DRAWING_POLYLINE });

            $(".map-measure").click(function () {
                drawManage.open();
                $(".boxopt").click();
            });

            $(".map-clear").click(function () {
                drawManage.clear();
                $(".boxopt").click();
            });
        });

        //地图缩放事件处理函数
        function zoomend() {
            currentZoomLevel = map.getZoom();
            console.log(currentZoomLevel)
        }

        //【添加涂层】回调事件
        function addLayer() {
            //将Layer图层加载到Map对象上
            map.addLayers([layer,lineLayer]);
            //map.addLayers([layer, markerlayer, vectorLayer]);
            //出图，map.setCenter函数显示地图
            map.setCenter(transform(new SuperMap.LonLat(113.75, 22.4)), 6);
        }

        //绘完触发事件
        function drawCompleted(drawGeometryArgs) {
            //停止画面控制
            drawLine.deactivate();
            alert('drawCompleted');
            //获得图层几何对象
            var geometry = drawGeometryArgs.feature.geometry,
                measureParam = new SuperMap.REST.MeasureParameters(geometry), /* MeasureParameters：量算参数类。 客户端要量算的地物间的距离或某个区域的面积*/
                myMeasuerService = new SuperMap.REST.MeasureService(url); //量算服务类，该类负责将量算参数传递到服务端，并获取服务端返回的量算结果
            myMeasuerService.events.on({"processCompleted": measureCompleted});

            //对MeasureService类型进行判断和赋值，当判断出是LineString时设置MeasureMode.DISTANCE，否则是MeasureMode.AREA

            myMeasuerService.measureMode = SuperMap.REST.MeasureMode.DISTANCE;

            myMeasuerService.processAsync(measureParam); //processAsync负责将客户端的量算参数传递到服务端。
        }

        //坐标转换
        function transform(lonLat) {
            if (!isTransform) {
                return lonLat;
            }

            if (lonLat && lonLat.CLASS_NAME && (lonLat.CLASS_NAME == 'SuperMap.LonLat' || lonLat.CLASS_NAME == 'SuperMap.Geometry.Point')) {
                //坐标转换
                lonLat.transform(destProjection, sourceProjection);
                return lonLat;
            }

            throw new Error("not a valid SuperMap.LonLat or SuperMap.Geometry.Point object");
        }

    </script>
</head>
<body>
    <div id="app-right-top">
        <div id="tool-container" class="toolscontainer">
            <div class="ui3-control-wrap clearfixs" id="ui3_control_wrap">
                <div class="ui3-city-change-content " id="ui3_city_change">
                    <!-- 主菜单 -->
                    <div  map-on-click="box">
                        <span class="adjustpadding"></span>
                        <span class="radar-item" id="radar" ><img alt="天气" src="${ctxStaticRoot}/maptoolbar/Content/image/3.png"></span>
                        <a href="#" map-on-click="selectCity" onclick="return false" class="ui3-city-change-inner ui3-control-shadow">
                            <span>大铲雷达</span><em></em>
                        </a>
                    </div>

                    <div class="map_popup " style="width: 283px; display: none; height: 80px; right: 0px; top: 47px;">
                        <div class="popup_main">
                            <div class="title">雷达列表</div>
                            <div class="content" style="overflow: hidden;">
                                <div class="sel_city">
                                    <div id="radar-list-detail" class="" style="display: block; width: 317px; height: 80px; right: 69px; top: 57px">
                                        <ul class="list">
                                            <li>
                                                <i class="icon default"></i>
                                                <div class="mylocation-box">
                                                    <span class="caption">大铲雷达</span><span class="addr color-weak text-overflow">大铲岛2号山头</span>
                                                    <span class="setting"><a href="javascript:;" data-action="edit" class="edit">设为默认</a></span>
                                                </div>
                                            </li>
                                            <li>
                                                <i class="icon none"></i>
                                                <div class="mylocation-box">
                                                    <span class="caption">蛇口雷达</span>
                                                    <span class="addr color-weak text-overflow">蛇口SCT大楼</span>
                                                    <span class="setting"><a href="javascript:;" data-action="edit" class="edit">设为默认</a></span>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <button id="popup_close" title="关闭"></button>
                        </div>
                        <div class="poput_shadow" style="height: 80px;"></div>
                    </div>
                </div>

                <div class="left float-l">
                    <b class="tool-gap"></b>
                    <div class="trafficopt" map-on-click="traffic">
                        <span id="traffic_control" class="last traffic"></span><i>隐藏图例</i>
                    </div>
                    <b></b>
                </div>

                <!-- 我们想要改成这样，每个工具条一个div -->
                <div id="toolbar1" class="left float-l">
                    <!-- 主菜单 -->
                    <div class="boxopt" map-on-click="box">
                        <span id="util_control" class="boxutils boxicon"></span>
                        <i class="boxtext">工具</i><em></em>
                    </div>
                    <!-- 弹出内容 -->
                    <div class="detail-box" style="display: none;">
                        <ul id="boxul" class="boxinfo">
                            <li class="map-measure" map-on-click="measure"><span class="last measure"></span><i>测距</i></li>
                            <li class="map-mark" map-on-click="mark"><span class="last mark"></span><i>标记</i></li>
                            <li class="map-clear" map-on-click="share"><span class="last share"></span><i>清除</i></li>
                            <!-- <li class="map-share" map-on-click="share"><span class="last share"></span><i>异常船舶统计</i></li>-->
                        </ul>
                    </div>
                </div>
            </div>

        </div>
    </div>
    <div id="map" style="position: absolute; left: 0px; right: 0px; width: 100%; height: 100%;">

    </div>
</body>
</html>
