function cycleImages(){
    var $active = $('#slideshow .active');
    var $next = ($active.next().length > 0) ? $active.next() : $('#slideshow li:first');
    writeInfo($next); // write artwork name and author in the footer
    $next.css('z-index',2);//move the next image up the pile
    $active.fadeOut(2000,function(){//fade out the top image
        $active.css('z-index',1).show().removeClass('active');//reset the z-index and unhide the image
        $next.css('z-index',3).addClass('active');//make the next image the top one
    });
}

// write artwork info on the slideshow image
function writeInfo(art) {
    var opera = Opera[art.attr('data-index')];
    var info = opera.nome + ' - ' + opera.artista.nome;
    var $operaInfo = $('#operaInfo');

    if ($operaInfo.text() !== "") {
        $operaInfo.fadeOut(1000,function() {
            $(this).text(info);
        }).fadeIn(1000);
    } else {
        $operaInfo.text(info);
    }
}

var imgType = "jpg"; // global var that stores the type of images to use
// check whether or not browser supports webp images
Modernizr.on('webp', function(result) {
    if (result) {
        imgType = "webp";
    }
});

$(window).on('load', function () {
    // set proper height for the filterBox
    $('#filterBox').css({
        'margin-top': $("#searchBox").outerHeight(true)+10 + "px"
    });
    // create as much li as there are artworks (actually take only 5 to not make client download every image)
    // load slider images as background
    var $slider = $('#slideshow');
    var k = 0;
    var numImages = 4; // how many images will appear in the slideshow
    var keys = Object.keys(Opera);
    var maxImages = keys.length;
    while (k < numImages && k < maxImages) { // we could make the 5 images choice random instead of linear
        var img = Opera[keys[k]].img+'_720.'+imgType;
        var $item = $('<li></li>')
            .attr('data-index', keys[k])
            .css('background-image', 'url(./img/opere/'+img+')');
        $slider.append($item);
        k++;
    }
    $('#slideshow li:first').addClass('active');
    writeInfo($('#slideshow li.active'));
    // cycle every 5s
    setInterval('cycleImages()', 5000); // timeout must be more than the fadeOut duration

    showTutorial(currentPage);
});

var $searchBox = $('#searchBox');
var $searchBoxInput = $('#searchBox input');
$searchBox.on('click', function (e) {
    if ($searchBoxInput.prop('disabled'))
        return;
    if (e.target.id !== "speakBtn") {
        $searchBoxInput.trigger('focus');
    }
});

var $speakBtn = $('#speakBtn');
$speakBtn.on('click', function (e) {
    e.stopImmediatePropagation();
    if ($searchBoxInput.prop('disabled'))
        return;
    recognition.start();
    console.log('Ready to receive a word command.');
});


var storage;
if (typeof(Storage) !== "undefined") {
    storage = true;
} else {
    storage = false;
    console.warn("The browser does not support Storage");
}
function showTutorial(page) {
    if (storage) {
        if (sessionStorage.getItem(page) ===  "true")
            return;
    }
    $searchBoxInput.prop('disabled', true);
    var $tutorial = $('<div id="tutorial"></div>');
    var $tutBtn = $('<input id="tutBtn" type="button" value="Ho capito">')
        .on('click', function () {
            $searchBoxInput.prop('disabled', false);
            // don't show the tutorial again by saving state in Storage
            if (storage) {
                sessionStorage.setItem(page, "true");
            }

            $tutorial.remove();
        });

    $tutorial.append($tutBtn);
    $('body').prepend($tutorial);

    // load correct images based on page
    if (page.includes("opera_page")) {
    } else {
        var $index1 = $('<img src="./img/tutorial/index/index_1.png">')
            .css({
                'top': $searchBox.offset().top + $searchBox.height() + 5,
                'left': 10
            });
        var $index2 = $('<img id="tut2" src="./img/tutorial/index/index_2.png">')
            .css({
                'top': $searchBox.offset().top + $searchBox.height() + 5
            });

        $tutorial.append([$index1, $index2]);
        $index2.css('left', $speakBtn.offset().left - $index2.width()*0.65); // set left based on img size
    }


}