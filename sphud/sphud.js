// hack for getting liveDesignOptops object from window into extension execution env.
function retrieveWindowVariables(variables) {
    var ret = {};
    var scriptContent = "";
    for (var i = 0; i < variables.length; i++) {
        var currVariable = variables[i];
        scriptContent += "if (typeof " + currVariable + " !== 'undefined') $('body').attr('tmp_" + currVariable + "', JSON.stringify(" + currVariable + "));\n"
    }
    scriptContent += "$('body').attr('tmp_path', window.location.pathname);"

    var script = document.createElement('script');
    script.id = 'tmpScript';
    script.appendChild(document.createTextNode(scriptContent));
    (document.body || document.head || document.documentElement).appendChild(script);

    for (var i = 0; i < variables.length; i++) {
        var currVariable = variables[i];
        if ($("body").attr("tmp_" + currVariable) != undefined) {
            ret[currVariable] = $.parseJSON($("body").attr("tmp_" + currVariable));
            $("body").removeAttr("tmp_" + currVariable);
        }
        ret['pathname'] = $("body").attr("tmp_path");
        $("body").removeAttr("tmp_path");
    }

     $("#tmpScript").remove();
    return ret;
}

function isAdminPage () {
    return $("script[src*='/store/admin/']").length > 1;
}

var windowVariables = retrieveWindowVariables(["liveDesignOptions", "AC"]);
var liveDesignOptions = windowVariables.liveDesignOptions;
var siteType = 'TBD';
var isSP = typeof windowVariables.AC == 'object';
var ldOn = typeof liveDesignOptions == 'object';
var pathname = windowVariables.pathname;
var isAdmin = isAdminPage();

function determineSiteType() {
    if (!isSP) {
        siteType = "notSP";
    } else if (isSP && !ldOn && !isAdmin) {
        siteType = "ldOff";
    } else if (ldOn) {
        siteType = "ldOn";
    }
    else if (isAdmin) {
        siteType = "admin";
    }
    return siteType;
}

function getSiteMonitorData() {
    var response = $.ajax({
        type: "GET",
        url: "/store/sitemonitor.aspx",
        async: false
    }).responseText;
    var data = response.split("&");
    var obj = {};
    for (var i = 0, l = data.length; i < l; i++) {
        var key = data[i].split("=")[0];
        var val = data[i].split("=")[1];
        obj[key] = val;
    }
    return obj;
}

function insertBase () {
    var colOne = $('<div id="sphud-col-one" class="col-md-3" style="list-style: none;"></div>');
    var colTwo = $('<div id="sphud-col-two" class="col-md-3" style="list-style: none;"></div>');
    var colThree = $('<div id="sphud-col-three" class="col-md-3" style="list-style: none;"></div>');
    var colFour = $('<div id="sphud-col-four" class="col-md-3 style="list-style: none;"></div>');
    colOne.append($('<ul id="sphud-ul-one" style="list-style: none;"></ul'));
    colTwo.append($('<ul id="sphud-ul-two" style="list-style: none;"></ul'));
    colThree.append($('<ul id="sphud-ul-three" style="list-style: none;"></ul'));
    colFour.append($('<ul id="sphud-ul-four" style="list-style: none;"></ul'));
    $('body').append('<div id="sphud"></div>');
    $('#sphud').append('<div class="row"></div>');
    $('#sphud > div.row').append(colOne);
    $('#sphud > div.row').append(colTwo);
    $('#sphud > div.row').append(colThree);
    $('#sphud > div.row').append(colFour);
}

function insertAdmin (siteMonitor) {
            $('#sphud-ul-one').append('<li><span class="ldo-label">Store:</span> <span class="ldo-data">' + siteMonitor["Store Name"] + '</span></li>');
            $('#sphud-ul-one').append('<li><span class="ldo-label">Domain:</span> <span class="ldo-data">' + siteMonitor["DomainName"] + '</span></li>');
            $('#sphud-ul-one').append('<li><span class="ldo-label">Version:</span> <span class="ldo-data">' + siteMonitor["Code Version"] + '</span></li>');
            $('#sphud-ul-one').append('<li><span class="ldo-label">Machine:</span> <span class="ldo-data">' + siteMonitor["Machine Name"] + '</span> | <a  id="close-sphud" href="#sphud">X</a></li>');
            $('#sphud-ul-two').append('<li><a href="/store/admin/reports/accountusagereport.aspx">Account Usage</a></li>');
            $('#sphud-ul-two').append('<li><a href="/store/admin/tools/viewaudithistory.aspx">Audit History</a></li>');
            $('#sphud-ul-two').append('<li><a href="/Store/Admin/Tools/Support/ErrorLog.aspx">Error Log</a></li>');
            $('#sphud-ul-two').append('<li><a href="/store/admin/tools/support/BackgroundProcessLog.aspx?">Background Process Log</a></li>');
            $('#sphud-ul-three').append('<li><a href="/store/admin/content/localizationlist.aspx">Store Text & Language</a></li>');
            $('#sphud-ul-three').append('<li><a href="/store/admin/tools/viewaudithistory.aspx">Audit History</a></li>');
            $('#sphud-ul-three').append('<li><a href="/Store/Admin/Tools/Support/ErrorLog.aspx">Error Log</a></li>');
            $('#sphud-ul-three').append('<li><a href="/store/admin/tools/support/BackgroundProcessLog.aspx?">Background Process Log</a></li>');
            $('#sphud-ul-four').append('<li><a href="/store/admin/tools/analyticrules.aspx?type=Order">Rule Engine</a></li>');
            $('#sphud-ul-four').append('<li><a href="/Store/Admin/Settings/Payments/PaymentGatewayList.aspx?">Payment Gateways</a></li>');
            $('#sphud-ul-four').append('<li><a href="/Admin/Settings/shipping/shippingoptions.aspx">Shipping Options</a></li>');
            $('#sphud-ul-four').append('<li><a href="/store/admin/settings/users/userlist.aspx?">User Accounts</a></li>');
}

function insertLdOff(siteMonitor) {
    insertAdmin(siteMonitor);
    $('#sphud').append('<a id="sphud-login" href="' + window.location.pathname + '?livedesign=on">Login to Admin for more Info</a>');
}

function insertLdOn (liveDesignOptions, siteMonitor) {
    var ldo = liveDesignOptions;
    var id = ldo.entityId;
    var entityUrls = {
        "Category": "/store/admin/products/categorylist.aspx?ovu=/store/admin/products/CategoryEdit.aspx%3FcatID%3D" + id + "&ovw=0&ovn=0",
        "ProductDetails": "/store/admin/products/listproducts.aspx?ovu=/store/admin/Products/ProductEdit/General.aspx%3FID%3D" + id + "&ovw=0&ovn=1",
        "CMS": "/store/admin/content/pagelist.aspx?ovu=/store/admin/content/PageEdit.aspx%3FID%3D" + id + "&ovw=0&ovn=0",
        "Manufacturer": "/store/admin/products/manufacturerlist.aspx?ovu=/store/admin/products/ManufacturerEdit.aspx%3FmfgID%3D" + id + "&ovw=0&ovn=0",
        "BlogPost": "/store/admin/content/blogs/blogpostlist.aspx?ovu=/store/admin/content/blogs/BlogPostEdit.aspx%3FID%3D" + id + "&ovw=0&ovn=0",
        "BlogRoll": "/store/admin/content/blogs/bloglist.aspx?ovu=/store/admin/content/blogs/BlogEdit.aspx%3FID%3D" + id + "&ovw=0&ovn=0",
        "Default": "/store/admin/themes/v2/HtmlEditor.aspx?edit=theme%2fDefault&themeid=" + ldo.themeId + "&layoutid=",
        "ShoppingCart": "/store/admin/themes/v2/HtmlEditor.aspx?edit=Pages%2fShoppingCart&themeid=" + ldo.themeId + "&layoutid="
    };
    var entityUrl = entityUrls[ldo.pageType];
    var layoutUrls = {
        "Category": "/store/admin/themes/v2/HtmlEditor.aspx?edit=Pages%2fCategory&themeid=" + ldo.themeId + "&layoutid=",
        "ProductDetails": "/store/admin/themes/v2/HtmlEditor.aspx?edit=Pages%2fProductDetails&themeid=" + ldo.themeId + "&layoutid=",
        "CMS": "/store/admin/themes/v2/HtmlEditor.aspx?edit=Pages%2fCMS&themeid=" + ldo.themeId + "&layoutid=",
        "Manufacturer": "/store/admin/themes/v2/HtmlEditor.aspx?edit=Pages%2fManufacturer&themeid=" + ldo.themeId + "&layoutid=",
        "BlogPost": "/store/admin/themes/v2/HtmlEditor.aspx?edit=Pages%2fBlogPost&themeid=" + ldo.themeId + "&layoutid=",
        "BlogRoll": "/store/admin/themes/v2/HtmlEditor.aspx?edit=Pages%2fBlogRoll&themeid=" + ldo.themeId + "&layoutid=",
        "Default": "/store/admin/themes/v2/HtmlEditor.aspx?edit=theme%2fDefault&themeid=" + ldo.themeId + "&layoutid=",
        "ShoppingCart": "/store/admin/themes/v2/HtmlEditor.aspx?edit=Pages%2fShoppingCart&themeid=" + ldo.themeId + "&layoutid="
    };
    var entityType = {
        "Category": "Cat ID",
        "ProductDetails": "Prod ID",
        "Manufacturer": "Man ID",
        "BlogPost": "Post ID",
        "BlogRoll": "Blog ID",
        "Default": "Homepage ID",
        "ShoppingCart": "ShoppingCart ID"
    };
    var layoutUrl = layoutUrls[ldo.pageType];
    var editTheme = "/store/admin/themes/v2/Default.aspx?ThemeID=" + ldo.themeId + "&edit=theme%2fGlobalSettings";
    var editCss = "/store/admin/themes/v2/CssEditor.aspx?edit=theme%2fGlobalCSS&themeid=" + ldo.themeId;
    $('#sphud-ul-one').append('<li><span class="ldo-label">Store:</span> <span class="ldo-data">' + siteMonitor["Store Name"] + '</span></li>');
    $('#sphud-ul-one').append('<li><span class="ldo-label">Domain:</span> <span class="ldo-data">' + siteMonitor["DomainName"] + '</span></li>');
    $('#sphud-ul-one').append('<li><span class="ldo-label">Version:</span> <span class="ldo-data">' + siteMonitor["Code Version"] + '</span></li>');
    $('#sphud-ul-one').append('<li><span class="ldo-label">Machine:</span> <span class="ldo-data">' + siteMonitor["Machine Name"] + '</span> | <a  id="close-sphud" href="#sphud">X</a></li>');
    $('#sphud-ul-two').append('<li><span class="ldo-label">Theme:</span></li>');
    $('#sphud-ul-two').append('<li><span class="ldo-data">&nbsp;-&nbsp;' + ldo.themeId + '(' + ldo.realThemeId + ')</span></li>');
    $('#sphud-ul-two').append('<li>&nbsp;-&nbsp;<a href="' + editTheme + '">' + ldo.themeName + '</a></li>');
    $('#sphud-ul-two').append('<li>&nbsp;-&nbsp;<a href="' + editCss + '">CSS</a></li>');
    $('#sphud-ul-two').append('<li><span class="ldo-data">&nbsp;-&nbsp;/Shared/Themes/' + ldo.themeDir + '</span></li>');
    $('#sphud-ul-three').append('<li><span class="ldo-label">' + entityType[ldo.pageType] + ': </span><span class="ldo-data">' + ldo.entityId + ' </span><a href="' + entityUrl + '">(edit)</a></li>');
    $('#sphud-ul-three').append('<li><span class="ldo-label">Layout ID:</span> <span class="ldo-data">' + ldo.selectedLayoutId + ' </span><a href="' + layoutUrl + ldo.selectedLayoutId + '">(edit)</a></li>');
    $('#sphud-ul-three').append('<li><span class="ldo-label">Dflt Layout:</span> <span class="ldo-data">' + ldo.defaultLayoutId + ' </span><a href="' + layoutUrl + '">(edit)</a></li>');
    $('#sphud-ul-four').append('<li><span class="ldo-label">Cache Cleared:</span> <span class="ldo-data">' + ldo.clearCacheNoticeLastCleared + '</span>(<a href="/store/admin/actions.aspx?ClearCache=true">Clear</a>)</li>');
    $('#sphud-ul-four').append('<li><a href="#st-load" id="st-load" class="load-st" style="display: inline;">Support Tools</a>');
    $('#sphud-ul-four').append('<li><span class="ldo-label"></span> <span class="ldo-data"></span><a href="/store/admin/orders/orderlist.aspx">Order List</a></li>');
    $('#sphud-ul-four').append('<a href="/Store/Admin/Settings/shipping/shippingoptions.aspx">Shipping Settings</a></li>');
    $(function() {
        //When load-st is clicked...
        $('.load-st').on('click', function() {
            //Set verbosity 
            var set_verb = $.ajax({
                type: "POST",
                url: "/store/admin/ajax/admin.asmx/SetLoggerVerbosityLevel",
                data: JSON.stringify({
                    level: 3
                }),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                async: false
            }).responseText;
            try {
                //Get Support Tools Data
                var temp = $.ajax({
                    type: "POST",
                    url: "/store/admin/ajax/admin.asmx/GetCurrentLoggerData",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    async: false
                }).responseText;
                //parse the data into text
                result = JSON.parse(temp).d;
                var txt = "";
                var $details = $(result.TraceInfo).find(".traceInfoDetails")
                $.each($details, function(index, value) {
                    txt = txt.concat($(value).text() + "\\n");
                });
                alert(txt);
            } catch (e) {
                alert("Verbosity set. Reload page, then click support tools again for data");
            }
        });
    });

}

function insertSphud(siteType) {
    console.log("SPHUD Site Type: " + siteType);
    if (siteType != "notSP") {
        var siteMonitor = getSiteMonitorData();
        insertBase();
        if (siteType == "admin") {
            insertAdmin(siteMonitor);
        };
        if (siteType == "ldOff") {
            insertLdOff(siteMonitor);
        };
        if (siteType == "ldOn") {
            insertLdOn(liveDesignOptions, siteMonitor);
        } else {};
    }
}

siteType = determineSiteType();
insertSphud(siteType);