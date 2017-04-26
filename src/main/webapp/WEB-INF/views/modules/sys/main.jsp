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
            vectorLayer,
            markerlayer,
            isTransform = true, //是否需要进行坐标转换
            sourceProjection = 'EPSG:3857',
            destProjection = 'EPSG:4326';

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
            //vectorLayer = new SuperMap.Layer.Vector();
            //markerlayer = new SuperMap.Layer.Markers("markerLayer");
        }

        //地图缩放事件处理函数
        function zoomend() {
            currentZoomLevel = map.getZoom();
        }

        //【添加涂层】回调事件
        function addLayer() {
            //将Layer图层加载到Map对象上
            map.addLayers([layer]);
            //map.addLayers([layer, markerlayer, vectorLayer]);
            //出图，map.setCenter函数显示地图
            map.setCenter(transform(new SuperMap.LonLat(113.75, 22.4)), 6);
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
    <div id="map" style="position: absolute; left: 0px; right: 0px; width: 100%; height: 100%;">
    </div>
</body>
</html>
