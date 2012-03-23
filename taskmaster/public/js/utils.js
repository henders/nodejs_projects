// our global object
var taskmaster = JSON.parse($.cookie('taskmaster')) || {};

function createSignature(path, paramObject) {
    var now = new Date();
    paramObject.timestamp = now.getTime();
    // Create query string from object
    var queryString = "?";
    var keys = _.keys(paramObject);
    console.log("keys = " + JSON.stringify(keys));
    keys.sort();
    _.each(keys, function(key) { queryString += key + "=" + paramObject[key] + "&"; });

    var sig = path + queryString;
    console.log('hashing sig: ' + sig);
    return Crypto.HMAC(Crypto.SHA256, sig, navigator.userAgent);
}

function showMsg(message) {
    //show error message
    $( "<div class='ui-loader ui-overlay-shadow ui-body-e ui-corner-all'><h1>"+ message +"</h1></div>" )
        .css({ "display": "block", "opacity": 0.96, "top": $( window ).scrollTop() + 100 })
        .appendTo( $.mobile.pageContainer )
        .delay( 1200 )
        .fadeOut( 600, function() {
            $( this ).remove();
        });
}

$(function() {
    var fixgeometry = function() {
        console.log("fixing geometry");
        /* Some orientation changes leave the scroll position at something
         * that isn't 0,0. This is annoying for user experience. */
        scroll(0, 0);

        /* Calculate the geometry that our content area should take */
        var header = $(".ui-header:visible");
        var footer = $(".ui-footer:visible");
        var content = $(".ui-content:visible");
        var viewport_height = $(window).height();

        var content_height = viewport_height - header.outerHeight() - footer.outerHeight();

        /* Trim margin/border/padding height */
        content_height -= (content.outerHeight() - content.height());
        content.height(content_height);
    }; /* fixgeometry */
});

