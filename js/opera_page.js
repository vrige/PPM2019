var $img = $(new Image());
// FIXME: speech_rec not working?
// TODO : fix description height to handle long text (it should have a dynamic height)
// TODO : when zooming a detail get the detail from the larger image and not from the scaled down image to avoid quality drop
$(window).on('load', function () {
    // generate page html
    console.log("Opera: "+operaID);
    var opera = Opera[operaID];

    $('title').text(opera.nome);
    $('#headerWrapper h1').text(opera.nome+', '+opera.artista.nome);
    $('#headerWrapper')
        .prepend(
            $('<span id="backBtn"></span>')
                .on('click', function () {
                    window.history.back();
                })
        );

    var $image = $('#artImage');
    $('#name').text(opera.nome+', ');
    $('#artist').text(opera.artista.nome+', ');
    $('#year').text(opera.data);
    $('#location').text(opera.ubicazione.nome);
    $('#description').text(opera.descrizione);
    $('#info').data('operaInfo', $('#info').html()); // save the art details to restore

    $image.html('<div class="loader"></div>');
    if (opera.img === "") {
        $image
            .css({'font-size': '12px',
                'text-align': 'center'
                }
            )
            .text('Immagine non disponibile');
        return;
    }

    $img[0].src = "./img/slideshow/"+opera.img+"."+imgType;
    $img.css({
        'visibility': 'hidden',
        'width': '100%',
        'height': '100%'
    });

    // append the right image based on the screen dimension
    /*$image.html($(document.createElement("picture"))
        .append($(document.createElement('source'))
            .attr({
                'type': 'image/webp',
                'srcset': "./img/slideshow/"+opera.img+".webp 1.5x, ./img/slideshow/"+opera.img.replace("_820", "")+".webp 2x"
            })
        )
        .append($(document.createElement("img"))
            .attr({
                'src': "./img/slideshow/"+opera.img+".jpg"
            })
            .css('width', '100%')
        )
    );
    return;*/

    $img.on('load', function () {
        var $canvas = $(document.createElement('canvas'))
            .attr('id', 'operaCanvas')
            .text('Il tuo browser è troppo vecchio!');
        var $input = $(document.createElement('input'))
            .attr({
                'id': 'detailsBtn',
                'type': 'checkbox'
            });

        $image.html($img); // print the image to get dimensions
        // FIXME: on iOS 9 the image appears to have height=0 when inserted in the div, so canvas will not be visible

        $canvas
            .data({
                'width': $img.width(),
                'height': $img.height()
            }) // save width and height to restore
            .css({
                'width': $img.width(),
                'height': $img.height()
            });

        var ctx = $canvas[0].getContext("2d");
        ctx.drawImage($img[0], 0, 0, $canvas[0].width, $canvas[0].height);

        $image
            .html($canvas)
            .append($input)
            .append($(document.createElement("span"))
                    .attr('id', 'detailsInfo')
                    .text('Clicca l\'immagine per mostrare/nascondere i dettagli')
            );
    });
});

var inDetail = false; // prevent from firing detail check when already in a detail
$('#filterBox').on('click', '#operaCanvas', function (e) {
    e.stopImmediatePropagation();
    var $detailsBtn = $('#detailsBtn');

    // check if a detail has been clicked and draw it
    if ($detailsBtn[0].checked && !inDetail) {
        var imgW = $(this).width();
        var imgH = $(this).height();
        var x = e.offsetX;
        var y = e.offsetY;
        var dets = Opera[operaID].dettagli;
        for (var i in dets) {
            var det = dets[i];
            var detX = det.x / 100 * imgW;
            var detY = det.y / 100 * imgH;
            var detW = det.width / 100 * imgW;
            var detH = det.height / 100 * imgH;
            // if clicked in a detail box
            if ((detX <= x && x <= detX + detW) && (detY <= y && y <= detY + detH)) {
                inDetail = true;
                var canvas = $('#operaCanvas')[0];
                var ctx = canvas.getContext("2d");
                // update dimensions with to match the real image
                detX = det.x / 100 * $img[0].width;
                detY = det.y / 100 * $img[0].height;
                detW = det.width / 100 * $img[0].width;
                detH = det.height / 100 * $img[0].height;

                ctx.clearRect(0,0, canvas.width, canvas.height);
                // check if the resized height fits in the canvas, else resize the width
                if(detH*$(canvas).width()/detW <= $(canvas).height()) {
                    $(canvas).css('height', detH*$(canvas).width()/detW);
                    ctx.drawImage($img[0], detX, detY, detW, detH, 0, 0, canvas.width, canvas.height);
                } else {
                    $(canvas).css('width', detW*$(canvas).height()/detH);
                    ctx.drawImage($img[0], detX, detY, detW, detH, 0, 0, canvas.width, canvas.height);
                }
                // update info
                $('#name').text(det.nome);
                $('#artist').text('');
                $('#year').text('');
                $('#location').text('');
                $('#description').text(det.descrizione);
                return;
            }
        }
    }
    inDetail = false;
    $detailsBtn[0].checked = !$detailsBtn[0].checked;
    $detailsBtn.trigger('change');
})
    .on('change', '#detailsBtn', function () {
        var canvas = $('#operaCanvas')[0];
        var ctx = canvas.getContext("2d");
        if (this.checked) {
            // draw details
            var det = Opera[operaID].dettagli;
            if (Opera[operaID].hasOwnProperty("dettagli")) {
                ctx.lineWidth = "2";
                ctx.strokeStyle = "yellow";

                for (var i in det) {
                    ctx.strokeRect(det[i].x/100*canvas.width,det[i].y/100*canvas.height,det[i].width/100*canvas.width,det[i].height/100*canvas.height);
                }
            }
        } else {
            // remove details
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // restore original dimensions
            $(canvas).css({
                'width': $(canvas).data('width'),
                'height': $(canvas).data('height')
            });
            ctx.drawImage($img[0], 0, 0, canvas.width, canvas.height);
            $('#info').html($('#info').data('operaInfo'));
        }
    });

/* serve la regex per evidenziare solo se la stringa cercata è
all'inizio di una parola ma indexOf() non accetta regex.
crea nuova funzione che usa search() (che accetta regex)
ma si comporta come indexOf()
*/
String.prototype.regexIndexOf = function(regex, startpos) {
    var indexOf = this.substring(startpos || 0).search(regex);
    return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
};

var $container = $('#description');
var original;
$('#searchBox input')
    .on('keyup', function(){
        $container.html(original);
        var output = $container.html();
        var word = $('#searchBox input').val().replace(/[^a-zA-Z0-9]/g, "").toLowerCase(); // input string

        // cycle through the text until no matches are found
        var i = 0;
        while (i+word.length<=output.length) {
            // get the index of a word that matches the input string (regex \b matches only begin of words)
            var start = output.replace(/[^a-zA-Z0-9]/g, " ").toLowerCase().regexIndexOf(new RegExp("\\b"+word, "g"), i);
            var end = start+word.length;
            if (start >= 0) {
                var $wrap = $(document.createElement("mark")) // wrap the text with mark html5 element to highlight it
                    .text(output.substring(start, end));
                output = [output.slice(0, start), $wrap[0].outerHTML, output.slice(end)].join('');
            } else break;
            i += start+$wrap[0].outerHTML.length;
        }
        $container.html(output);
    })
    // save the original text
    .on('focus', function () {
        original = $container.html();
    })
    // restore the original text
    .on('focusout', function () {
        $container.html(original);
        $('#searchBox input').val('');
    });