var opera = Opera[operaID];
var $img = $(document.createElement("img"))
    .attr('id', 'operaImage')
    .attr({
        'src': "./img/opere/"+opera.img+"_720.jpg"
    })
    .css('width', '100%');
// TODO : fix description height to handle long text (it should have a dynamic height)
// TODO : when zooming a detail get the detail from the larger image and not from the scaled down image to avoid quality drop
$(window).on('load', function () {
    // generate page html
    console.log("Opera: "+operaID);

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
    $('#name')
        .attr('data-info', 'nome opera titolo')
        .text(opera.nome)
        .after(', ');
    $('#artist')
        .attr('data-info', 'artista pittore autore')
        .text(opera.artista.nome)
        .after(', ');
    $('#year')
        .attr('data-info', 'anno')
        .text(opera.data);
    $('#location')
        .attr('data-info', 'ubicazione museo')
        .text(opera.ubicazione.nome);
    $('#description')
        .text(opera.descrizione);
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

    // print the image to get dimensions
    // html5 source to fetch the right image based on the screen dimension
    $image.html($(document.createElement("picture"))
        .append($(document.createElement('source'))
            .attr({
                'type': 'image/webp',
                'srcset': "./img/opere/"+opera.img+"_360.webp 360w, ./img/opere/"+opera.img+"_720.webp 720w,  ./img/opere/"+opera.img+"_1024.webp 1024w"
            })
        )
        .append($(document.createElement('source'))
            .attr({
                'type': 'image/jpeg',
                'srcset': "./img/opere/"+opera.img+"_360.jpg 360w, ./img/opere/"+opera.img+"_720.jpg 720w,  ./img/opere/"+opera.img+"_1024.jpg 1024w"
            })
        )
        .append($img)
    );

    $img.on('load', function () {
        var $canvas = $(document.createElement('canvas'))
            .attr('id', 'operaCanvas')
            .text('Il tuo browser è troppo vecchio!');
        var $input = $(document.createElement('input'))
            .attr({
                'id': 'canvasBtn',
                'type': 'checkbox'
            });

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
                    .attr('id', 'canvasInfo')
                    .text('Clicca l\'immagine per mostrare/nascondere i dettagli')
            );
    });
});

var inDetail = false; // prevent from firing detail check when already in a detail
$('#filterBox').on('click', '#operaCanvas', function (e) {
    e.stopImmediatePropagation();
    var $canvasBtn = $('#canvasBtn');

    // check if a detail has been clicked and draw it
    if ($canvasBtn[0].checked && !inDetail) {
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
                showDetail(det);
                return;
            }
        }
    } else if (inDetail) { // if the detail was drawn by searching for it, check the checkbox to act like it was clicked
        $canvasBtn[0].checked = true;
    }
    inDetail = false;
    $canvasBtn[0].checked = !$canvasBtn[0].checked;
    $canvasBtn.trigger('change');
})
    .on('change', '#canvasBtn', function () {
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
            $('#canvasInfo').text('Clicca l\'immagine per mostrare/nascondere i dettagli');
            $('#info').html($('#info').data('operaInfo'));
        }
    });

function showDetail(detail) {
    inDetail = true;
    var canvas = $('#operaCanvas')[0];
    var ctx = canvas.getContext("2d");
    // update dimensions to match the real image
    var detX = detail.x / 100 * $img[0].width;
    var detY = detail.y / 100 * $img[0].height;
    var detW = detail.width / 100 * $img[0].width;
    var detH = detail.height / 100 * $img[0].height;

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
    $('#canvasInfo').text('Clicca l\'immagine per tornare all\'opera completa');
    $('#title').html($('#title h2').html($('#name').text(detail.nome)));
    $('#description').text(detail.descrizione);
}

// highlight searched text or special artwork information or show detail
var $container = $('#info');
var original;
$('#searchBox input')
    .on('keyup', function(){
        $container.html(original);

        var details = Opera[operaID].dettagli;
        var word = $(this).val().replace(/[^a-zA-Z0-9]/g, "").toLowerCase(); // input string
        // if looking for a detail, show it immediately
        // FIXME: opening a detail when one is already opened causes the detail to shrink to previous one dimension
        for (var det in details) {
            if (word === details[det].nome.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()) {
                showDetail(details[det]);
                original = $container.html();
                $(this).trigger('focusout');
                return;
            }
        }

        // else look for the word or special info and mark it
        // if the searched word is a special info (museo, autore, ...), highlight it
        $('[data-info]').each(function () {
            var queries = $(this).attr('data-info').split(" ");
            if (queries.includes(word)) {
                $(this).wrap('<mark></mark>');
            }
        });

        // cycle through the text until no matches are found
        var $description = $container.children('#description');
        var output = $description.html();
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
        $description.html(output);
    })
    // save the original text
    .on('focus', function () {
        original = $container.html();
    })
    // restore the original text
    .on('focusout', function () {
        $container.html(original);
        $(this).val('');
    });

// new function that acts like indexOf() but accepts regex
String.prototype.regexIndexOf = function(regex, startpos) {
    var indexOf = this.substring(startpos || 0).search(regex);
    return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
};
