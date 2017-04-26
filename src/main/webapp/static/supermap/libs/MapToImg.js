(function() {
    var PrintMap = {};
    var LAYER_COUNT = 0;
    var LAYER_LENGTH = 0;
    window.MapToImg = PrintMap;

    var barObj = document.createElement("div");
    var barObj2, barObj3;
    var blockSize = 0;

    //更新进度条
    function updateBar(data) {

        //window.setTimeout(function (data) {
        //    return function () {
        //        data = data * 3;
        //        var bit = data / 300;
        //        var bit1 = parseInt(bit * 100);

        //       // barObj2.style.width = data;
        //       // barObj3.style.innerHTML = bit1 + '%';

        //        $("#barObj2").css('width', data);
        //        $('#barObj3').html(bit1 + '%');

        //    }
        //}(data), 10);

        data = data * 3;
        var bit = data / 300;
        var bit1 = parseInt(bit * 100);

        $("#barObj2").css('width', data);
        $('#barObj3').html(bit1 + '%');
    }

    //休眠函数
    function sleep(numberMillis) {
        var now = new Date();
        var exitTime = now.getTime() + numberMillis;
        while (true) {
            now = new Date();
            if (now.getTime() > exitTime) return;
        }
    }

    PrintMap.excute = function(map) {
        var canvas = document.createElement("canvas");
        var broz = SuperMap.Browser.name;
        if (!canvas.getContext || (broz == 'msie' && !canvas.msToBlob)) {
            alert("您的浏览器版本太低，请升级。");
            return;
        }
        LAYER_COUNT = 0;

        //画进度条
        barObj.className = "Bar";
        barObj.id = "barObj";
        var mapSize = map.getSize();
        barObj.style.left = mapSize.w / 2 - 150 + "px";
        barObj.style.top = mapSize.h / 2 + "px";
        document.body.appendChild(barObj);

        barObj2 = document.createElement("div");
        barObj2.id = "barObj2";
        barObj.appendChild(barObj2);

        barObj3 = document.createElement("span");
        barObj3.id = "barObj3";
        barObj2.appendChild(barObj3);

        updateBar(0.5);


        var layers = map.layers.concat([]);

        //layers排序，将markers放到最上边
        var layers1 = [];
        for (var i = 0; i < layers.length; i++) {
            if (layers[i].CLASS_NAME === "SuperMap.Layer.Markers") {
                var templayer = layers.splice(i, 1);
                layers1.push(templayer[0]);
            }
        }
        layers = layers.concat(layers1);

        LAYER_LENGTH = layers.length;
        var imgUrls = [];

        blockSize = parseInt(100 / LAYER_LENGTH);

        for (var i = 0; i < layers.length; i++) {
            var layer = layers[i];

            if (layer.CLASS_NAME === "SuperMap.Layer.TiledDynamicRESTLayer" && layer.visibility) {
                if (layer.useCanvas === false) {
                    draw(getImgLayerData(layer, map), i, imgUrls);
                } else {
                    draw(getCanvasLayerData(layer), i, imgUrls);
                }
            } else if (layer.CLASS_NAME === "SuperMap.Layer.Markers" && layer.visibility) {
                draw(getImgLayerData(layer, map), i, imgUrls);
            } else if (layer.CLASS_NAME === "SuperMap.Layer.Vector" && layer.visibility) {
                    getVectorLayerData(layer, map, function(imgUrls, i) {
                            return function(img) {
                                draw(img, i, imgUrls);
                            }
                        }(imgUrls, i)
                    );
            } else {
                draw(null, i, imgUrls);
            }
        }

    }

    function draw(img, i, imgUrls) {
        imgUrls[i] = img;
        LAYER_COUNT++;

        updateBar(LAYER_COUNT * blockSize);

        if (LAYER_COUNT >= LAYER_LENGTH) {

            var canvas = document.createElement("canvas");
            var size = map.getSize();
            canvas.height = size.h;
            canvas.width = size.w;
            var ctx = canvas.getContext("2d");

            canvas.style.position = "relative";
            canvas.style.border = "1px solid #4c4c4c";

            ////document.body.appendChild(canvas);

            //var panel = document.createElement("div");

            //panel.style.position = "absolute";
            //panel.style.left = "0px";
            //panel.style.top = "20px";
            //panel.style.height = "100%";
            //panel.style.width = "100%";
            //// panel.style.background = "#e6e8eb";
            //panel.style.background = "#ffffff";
            ////panel.style.background = "transparent";
            //document.body.appendChild(panel);


            //var buttonPanel = document.createElement("div");
            //buttonPanel.style.position = "relative";
            //buttonPanel.style.left = "0px";
            //buttonPanel.style.top = "0px";
            //panel.appendChild(buttonPanel);
            //panel.appendChild(canvas);

            updateBar(100);

            window.setTimeout(function() {
                for (var i = 0; i < imgUrls.length; i++) {
                    if (imgUrls[i]) {
                        ctx.drawImage(imgUrls[i], 0, 0);
                    }
                }

                document.body.removeChild(barObj);

                if (canvas.msToBlob) {

                    window.navigator.msSaveBlob(canvas.msToBlob(), 'map.png');
                    
                    //var button = document.createElement("input");
                    //buttonPanel.appendChild(button);
                    //button.type = "button";
                    //button.value = "保存";
                    //button.onclick = function() {
                    //    window.navigator.msSaveBlob(canvas.msToBlob(), 'map.png');
                    //}
                } else {
                    var aa = document.createElement("a");
                    //buttonPanel.appendChild(aa);
                    aa.target = "_blank";
                    aa.download = "map.png";
                    aa.href = canvas.toDataURL();

                    aa.click();

                    //var button = document.createElement("input");
                    //aa.appendChild(button);
                    //button.type = "button";
                    //button.value = "保存";
                }

                //var button = document.createElement("input");
                //buttonPanel.appendChild(button);
                //button.type = "button";
                //button.value = "关闭";
                //button.onclick = function() {
                //    document.body.removeChild(panel);
                //}
            }, 30);
        }
    }

//截取图片图层
    function getImgLayerData(layer, map) {
        var div = layer.div;
        var pdiv = div.parentNode;
        var offsetX = parseInt(pdiv.style.left.replace(/px/, ""));
        var offsetY = parseInt(pdiv.style.top.replace(/px/, ""));

        var canvas = document.createElement("canvas");
        var size = map.getSize();
        canvas.height = size.h;
        canvas.width = size.w;
        var ctx = canvas.getContext("2d");

        canvas.style.position = "absolute";
        canvas.style.left = "5px";
        canvas.style.top = "600px";
        canvas.style.border = "1px solid #f00";

        //document.body.appendChild(canvas);

        var divs = div.getElementsByTagName("div");
        for (var i = 0; i < divs.length; i++) {
            var div1 = divs[i];
            if (div1.style.display != "none") {
                var left = parseInt(div1.style.left.replace(/px/, ""));
                var top = parseInt(div1.style.top.replace(/px/, ""));
                var img = div1.getElementsByTagName("img")[0];
                var imgWidth = img.style.width;
                var imgHeight = img.style.height;
                var imgW = null, imgH = null;
                if (imgWidth != null || imgWidth != "") {
                    imgW = parseInt(imgWidth.replace(/px/, ""));
                }
                if (imgHeight != null || imgHeight != "") {
                    imgH = parseInt(imgHeight.replace(/px/, ""));
                }
                if (imgW != null && imgH != null) {
                    ctx.drawImage(img, left + offsetX, top + offsetY, imgW, imgH);
                } else {
                    ctx.drawImage(img, left + offsetX, top + offsetY);
                }
            }
        }

        var imageUrl = canvas.toDataURL("image/png");
        var img = new Image();
        img.src = imageUrl;
        return img;
    }

//截取canvas图层
    function getCanvasLayerData(layer) {
        var div = layer.div;
        var canvas0 = div.getElementsByTagName("canvas")[0];
        var imageUrl = canvas0.toDataURL("image/png");
        var img = new Image();
        img.src = imageUrl;

        return img;
    }

//截取Vector图层
    function getVectorLayerData(layer, map, callback) {

        var printLayer = new SuperMap.Layer.Vector("PRINT_LAYER", { visibility: true, renderers: ["Canvas2"] });

        var features1 = [];
        var features = layer.features;
        for (var j = 0; j < features.length; j++) {
            var feature = features[j];

            var feature1 = new SuperMap.Feature.Vector();
            feature1.geometry = feature.geometry.clone();

            //由于使用Canvas2渲染器, 样式改变, 故 船舶的point 要重新定义样式
            if (feature.geometry.CLASS_NAME === "SuperMap.Geometry.Point" &&
                !(feature.image.indexOf("SyPoint") >= 0 || feature.image.indexOf("AISPoint") >= 0)) {
                var style1 = {
                    fillColor: feature.style.fillColor,
                    strokeColor: feature.style.strokeColor,
                    pointRadius: feature.style.pointRadius,
                    strokeWidth:4
                };
                feature1.style = style1;
            } else {
                feature1.style = feature.style;
            }

            features1.push(feature1);
        }

        if (layer.style) {
            printLayer.style = layer.style;
        }
        printLayer.setOpacity(1);
        printLayer.addFeatures(features1);
        map.addLayer(printLayer);

        window.setTimeout(function(printLayer, map, callback) {
            return function() {
                var div = printLayer.div;
                var canvas1 = div.getElementsByTagName("canvas")[0];
                //var cxt1 = canvas1.getContext("2d");
                var imageUrl = canvas1.toDataURL("image/png");

                map.removeLayer(printLayer);

                printLayer.destroy();

                var img = new Image();
                img.src = imageUrl;

                callback(img);
            }
        }(printLayer, map, callback), 30);
    }
})();


//初始化船舶--图标字典
var dicShipImage = new Array();
//非图标--轨迹点--默认带黄色外环
dicShipImage["SyPoint1"] = "BLACK";
dicShipImage["SyPoint2"] = "MAGENTA";
dicShipImage["SyPoint3"] = "CYAN";
dicShipImage["SyPoint4"] = "blue";
dicShipImage["SyPoint5"] = "green";
dicShipImage["SyPoint6"] = "red";
dicShipImage["SyPoint7"] = "yellow";
//非图标--轨迹点(报警)
dicShipImage["SyPointA1"] = "BLACK";
dicShipImage["SyPointA2"] = "MAGENTA";
dicShipImage["SyPointA3"] = "CYAN";
dicShipImage["SyPointA4"] = "blue";
dicShipImage["SyPointA5"] = "green";
dicShipImage["SyPointA6"] = "red";
dicShipImage["SyPointA7"] = "yellow";
//非图标--ais
dicShipImage["AISPoint"] = "orange";

//自定义船图标(正常)
dicShipImage["SyShip1"] = "shippsBLACK";
dicShipImage["SyShip2"] = "shippsMAGENTA";
dicShipImage["SyShip3"] = "shippsCYAN";
dicShipImage["SyShip4"] = "shippsblue";
dicShipImage["SyShip5"] = "shippsgreen";
dicShipImage["SyShip6"] = "shippsred";
dicShipImage["SyShip7"] = "shippsyellow";
//自定义船图标(报警)
dicShipImage["SyShipA1"] = "shippsBLACK2";
dicShipImage["SyShipA2"] = "shippsMAGENTA2";
dicShipImage["SyShipA3"] = "shippsCYAN2";
dicShipImage["SyShipA4"] = "shippsblue2";
dicShipImage["SyShipA5"] = "shippsgreen2";
dicShipImage["SyShipA6"] = "shippsred2";
dicShipImage["SyShipA7"] = "shippsyellow2";
//新图标(惰性物料的)
dicShipImage["SyShipIm1"] = "shipimBLACK";
dicShipImage["SyShipIm2"] = "shipimMAGENTA";
dicShipImage["SyShipIm3"] = "shipimCYAN";
dicShipImage["SyShipIm4"] = "shipimblue";
dicShipImage["SyShipIm5"] = "shipimgreen";
dicShipImage["SyShipIm6"] = "shipimred";
dicShipImage["SyShipIm7"] = "shipimyellow";

dicShipImage["SyShipImA1"] = "shipimBLACK2";
dicShipImage["SyShipImA2"] = "shipimMAGENTA2";
dicShipImage["SyShipImA3"] = "shipimCYAN2";
dicShipImage["SyShipImA4"] = "shipimblue2";
dicShipImage["SyShipImA5"] = "shipimgreen2";
dicShipImage["SyShipImA6"] = "shipimred2";
dicShipImage["SyShipImA7"] = "shipimyellow2";

//没有中途监管站的
dicShipImage["SyShipDi1"] = "shipdiBLACK";
dicShipImage["SyShipDi2"] = "shipdiMAGENTA";
dicShipImage["SyShipDi3"] = "shipdiCYAN";
dicShipImage["SyShipDi4"] = "shipdiblue";
dicShipImage["SyShipDi5"] = "shipdigreen";
dicShipImage["SyShipDi6"] = "shipdired";
dicShipImage["SyShipDi7"] = "shipdiyellow";

dicShipImage["SyShipDiA1"] = "shipdiBLACK2";
dicShipImage["SyShipDiA2"] = "shipdiMAGENTA2";
dicShipImage["SyShipDiA3"] = "shipdiCYAN2";
dicShipImage["SyShipDiA4"] = "shipdiblue2";
dicShipImage["SyShipDiA5"] = "shipdigreen2";
dicShipImage["SyShipDiA6"] = "shipdired2"; 
dicShipImage["SyShipDiA7"] = "shipdiyellow2";

//回放点标记
dicShipImage["SyTrackPoint"] = "PIN4-32";

//红黑图标(闯关的,优先级别最高)
dicShipImage["SyShipRedBlack"] = "shippsBLACKRed";

//兼营的
dicShipImage["SyShipJy"] = "shipjyBLACK";
dicShipImage["SyShipJyA"] = "shipjyBLACK2";

//进出口同船运输
dicShipImage["SyShipExIm1"] = "shipExImBLACK";
dicShipImage["SyShipExIm2"] = "shipExImMAGENTA";
dicShipImage["SyShipExIm3"] = "shipExImCYAN";
dicShipImage["SyShipExIm4"] = "shipExImblue";
dicShipImage["SyShipExIm5"] = "shipExImgreen";
dicShipImage["SyShipExIm6"] = "shipExImred";
dicShipImage["SyShipExIm7"] = "shipExImyellow";

dicShipImage["SyShipExImA1"] = "shipExImBLACK2";
dicShipImage["SyShipExImA2"] = "shipExImMAGENTA2";
dicShipImage["SyShipExImA3"] = "shipExImCYAN2";
dicShipImage["SyShipExImA4"] = "shipExImblue2";
dicShipImage["SyShipExImA5"] = "shipExImgreen2";
dicShipImage["SyShipExImA6"] = "shipExImred2";
dicShipImage["SyShipExImA7"] = "shipExImyellow2";

//内外贸同船
dicShipImage["SyShipIntForTrade1"] = "syShipIntForTradeBLACK";
dicShipImage["SyShipIntForTrade2"] = "syShipIntForTradeMAGENTA";
dicShipImage["SyShipIntForTrade3"] = "syShipIntForTradeCYAN";
dicShipImage["SyShipIntForTrade4"] = "syShipIntForTradeblue";
dicShipImage["SyShipIntForTrade5"] = "syShipIntForTradegreen";
dicShipImage["SyShipIntForTrade6"] = "syShipIntForTradered";
dicShipImage["SyShipIntForTrade7"] = "syShipIntForTradeyellow";

//初始化画笔字典
var dicPen = new Array();
dicPen["LinePen1"] = "BLACK";
dicPen["LinePen2"] = "MAGENTA";
dicPen["LinePen3"] = "CYAN";
dicPen["LinePen4"] = "blue";
dicPen["LinePen5"] = "green";
dicPen["LinePen6"] = "red";
dicPen["LinePen7"] = "yellow";
//ais
dicPen["LinePenAis"] = "orange";
