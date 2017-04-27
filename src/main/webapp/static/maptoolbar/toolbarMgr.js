
function ToolbarMgrPkg(opt) {
    var self = this;
    this.config = opt;
    this.container = $(opt.container);
    this.boxopt = opt.boxopt[0]=="#" ? $(opt.boxopt) : this.container.find(opt.boxopt);
    this.popup = opt.popup[0] == "#" ? $(opt.popup) : this.container.find(opt.popup);

    this._state_= {
        infoBoxExpand: !1
    };
    this.show= function () {
        this._state_.infoBoxExpand = !0;
        if (this.boxopt) {
            this.boxopt.addClass("mark-active"),
            this.boxopt.find("span").addClass("active"),
            this.boxopt.find("em").addClass("active"),
            this.boxopt.find("i").addClass("active")
        }
        this.popup.show();
    };
    this.hide= function () {
        this._state_.infoBoxExpand = !1;
        this.popup.hide();
        if (this.boxopt) {
            this.boxopt.removeClass("mark-active"),
            this.boxopt.find("span").removeClass("active"),
            this.boxopt.find("em").removeClass("active"),
            this.boxopt.find("i").removeClass("active")
        }
    };
    this.toggleDisplay= function () {
        this._state_.infoBoxExpand ? this.hide() : this.show()
    };

    this.autoClose= function(t){
        var c = self.container;// toolbarMgr._state_.radarChangeExpand ? container.find(".citychangeopt") : container.find(".boxopt");
        for (var e = t.srcElement || t.target; e;) {
            for (var o = c, n = 0; n < o.length; n++)
                if (e == o[n])
                    return;
            if (e == document.body)
                return void self.hide();
            e = e.parentNode
        }

    };
    this.bind= function () {
        var a = this;
        if (this.boxopt) {
            this.boxopt.bind("click", function () {
                //addStat("usercenter.avatar.click", "click"),
                a.toggleDisplay()
            });
        } else {
            this.container.bind("click", function () {
                //addStat("usercenter.avatar.click", "click"),
                a.toggleDisplay()
            });
        }
        $(document.body).on("mousedown", this.autoClose);
    }


    return this;
}



//function ToolbarMgrPkg() {
//    var container = $("#tool-container");

//    var toolbarMgr = {
//        self: this,
//        _state_: {
//            infoBoxExpand: !1,
//            radarChangeExpand: !1
//        },
//        hide: function () {
//            this.hideToolbar();
//            this.hideRadarChange();
//        },
//        showToolbar: function () {
//            this._state_.infoBoxExpand = !0;
//            var boxopt = container.find(".boxopt");
//            boxopt.find("em").addClass("active");
//            container.find(".detail-box").show();
//        },
//        hideToolbar: function () {
//            this._state_.infoBoxExpand = !1;
//            var boxopt = container.find(".boxopt");
//            container.find(".detail-box").hide(),
//            boxopt.removeClass("mark-active"),
//            boxopt.find("span").removeClass("active"),
//            boxopt.find("em").removeClass("active"),
//            boxopt.find("i").removeClass("active")
//        },
//        toggleDisplay: function () {
//            this._state_.infoBoxExpand ? this.hideToolbar() : this.showToolbar()
//        },
//        showRadarChange: function () {
//            this._state_.radarChangeExpand = !0;
//            var boxopt = container.find(".citychangeopt");
//            boxopt.find("em").addClass("active");
//            boxopt.find("#radar-list-popup-win").show();
//        },
//        hideRadarChange: function () {
//            this._state_.radarChangeExpand = !1;
//            var boxopt = container.find(".citychangeopt");
//            container.find("#radar-list-popup-win").hide(),
//            boxopt.removeClass("mark-active"),
//            boxopt.find("span").removeClass("active"),
//            boxopt.find("em").removeClass("active"),
//            boxopt.find("i").removeClass("active")
//        },
//        toggleDisplay2: function () {
//            this._state_.radarChangeExpand ? this.hideRadarChange() : this.showRadarChange()
//        },

//        autoClose: function (t) {
//            var c = container;// toolbarMgr._state_.radarChangeExpand ? container.find(".citychangeopt") : container.find(".boxopt");
//            for (var e = t.srcElement || t.target; e;) {
//                for (var o = c, n = 0; n < o.length; n++)
//                    if (e == o[n])
//                        return;
//                if (e == document.body)
//                    return void toolbarMgr.hide();
//                e = e.parentNode
//            }

//        },
//        bind: function () {
//            var a = this;
//            //$("body").on("click", function() {
//            //    a.hide();
//            //}),
//            //container.on("click", function(a) {
//            //    a.stopPropagation()
//            //}),
//            container.find(".boxopt").bind("click", function () {
//                //addStat("usercenter.avatar.click", "click"),
//                a.toggleDisplay()
//            });
//            container.find(".citychangeopt").bind("click", function () {
//                //addStat("usercenter.avatar.click", "click"),
//                a.toggleDisplay2()
//            });
//            $(document.body).on("mousedown", this.autoClose);
//        }
//    };

//    return toolbarMgr;
//}