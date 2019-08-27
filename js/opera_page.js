var opera = Opera[operaID];
var $img = $(document.createElement("img"))
    .attr('id', 'operaImage')
    .attr({
        'src': "./img/opere/"+opera.img+"_720.jpg"
    })
    .css('width', '100%');
// TODO : fix description height to handle long text (it should have a dynamic height)
// TODO : when zooming a detail get the detail from the larger image and not from the scaled down image to avoid quality drop


var canvas = {
    element: $(document.createElement('canvas'))
        .attr('id', 'operaCanvas')
        .text('Il tuo browser è troppo vecchio!'),
    setWidth: function (w) {
        this.width = w;
        this.element[0].width = w;
    },
    setHeight: function (h) {
        this.height = h;
        this.element[0].height = h;
    },
    detailsShown: false,
    inDetail: false,
    toggleDetails: function() {
        if(!this.detailsShown) {
            // draw details
            var det = Opera[operaID].dettagli;
            if (Opera[operaID].hasOwnProperty("dettagli")) {
                this.detailsShown = true;
                this.context.lineWidth = "2";
                this.context.strokeStyle = "yellow";
                for (var i in det) {
                    this.context.strokeRect(det[i].x/100*this.width,det[i].y/100*this.height,det[i].width/100*this.width,det[i].height/100*this.height);
                }
            }
        } else {
            this.detailsShown = false;
            // remove details
            this.context.clearRect(0, 0, this.width, this.height);
            this.context.drawImage($img[0], 0, 0, this.width, this.height);
        }
    },
    animate: function (t, l, w) {
        if (!this.inDetail) {
            this.inDetail = true;
        }

        this.element.animate({
            top: t,
            left: l,
            width: w
        }, 500);
    }
};
var $imgWrap = $('#artImage');

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

    $imgWrap.html('<div class="loader"></div>');
    if (opera.img === "") {
        $imgWrap
            .css({'font-size': '12px',
                'text-align': 'center'
                }
            )
            .text('Immagine non disponibile');
        return;
    }

    // print the image to get dimensions
    // html5 source to fetch the right image based on the screen dimension
    $imgWrap.html($(document.createElement("picture"))
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

    $img.on('load', function () { // FIXME: img on load forces the jpg to be downloaded even if not necessary
        // FIXME: on iOS 9 the image appears to have height=0 when inserted in the div, so canvas will not be visible
        $imgWrap.css({
            'width': $img.width(),
            'height': $img.height()
        });
        canvas.setWidth($img.width());
        canvas.setHeight($img.height());
        canvas.context = canvas.element[0].getContext("2d");
        canvas.context.drawImage($img[0], 0, 0, $imgWrap.width(), $imgWrap.height());

        $imgWrap
            .html(canvas.element)
            .after($(document.createElement("span"))
                    .attr('id', 'canvasInfo')
                    .text('Clicca l\'immagine per mostrare/nascondere i dettagli')
            );
    });
});

$('#filterBox').on('click', '#operaCanvas', function (e) {
    e.stopImmediatePropagation();

    // check if a detail has been clicked and draw it
    if (canvas.detailsShown && !canvas.inDetail) {
        canvas.toggleDetails();
        var x = e.offsetX;
        var y = e.offsetY;
        var imgW = $(this).width();
        var imgH = $(this).height();
        var dets = Opera[operaID].dettagli;
        for (var i in dets) {
            var det = dets[i];
            var detX = det.x / 100 * imgW;
            var detY = det.y / 100 * imgH;
            var detW = det.width / 100 * imgW;
            var detH = det.height / 100 * imgH;
            // if clicked in a detail box
            if ((detX <= x && x <= detX + detW) && (detY <= y && y <= detY + detH)) {
                canvas.showDetail(det);
                return;
            }
        }
    } else if (canvas.inDetail) {
        canvas.animate(0, 0, canvas.width);
        canvas.inDetail = false;
        $('#canvasInfo').text('Clicca l\'immagine per mostrare/nascondere i dettagli');
        var $info = $('#info');
        $info.html($info.data('operaInfo'));
    } else {
        canvas.toggleDetails();
    }
});

canvas.showDetail = function(detail) {
    var imgW = canvas.width;
    var imgH = canvas.height;
    var detX = detail.x/100*imgW;
    var detY = detail.y/100*imgH;
    var detW = detail.width/100*imgW;
    var detH = detail.height/100*imgH;

    function getScale() { // returns scale and position
        var maxP, zoomW = 0, zoomH = 0, newDetW, newDetH, top, left;

        if (imgW >= imgH && detW === detH){
            maxP = (imgH-40)*100/imgW;
            zoomW = maxP*100/(detW*100/imgW); // ingrandimento in modo che il dettaglio occupi il maxP% in larghezza dello spazio disponibile
            top = (detY*zoomW/100)-20;//centra l'immagine in altezza
            left = (detX*zoomW/100)-(100-maxP)/2*imgW/100;//centra l'immagine in larghezza
        }
        if ((imgW >= imgH && detW/detH < imgW/imgH)||(imgW < imgH && detH/detW > imgH/imgW)){
            newDetW = (imgH-40)/detH*detW;//larghezza del dettaglio ingrandito
            maxP = 100*newDetW/imgW;
            zoomW = maxP*100/(detW*100/imgW);
            top = (detY*zoomW/100)-20;
            left = (detX*zoomW/100)-(100-maxP)/2*imgW/100;
        }
        if ((imgW >= imgH && detW/detH > imgW/imgH)||(imgW < imgH && detH/detW < imgH/imgW)){
            newDetH = (imgW-40)/detW*detH;
            maxP = 100*newDetH/imgH;
            zoomH = maxP*100/(detH*100/imgH);
            top = (detY*zoomH/100)-(100-maxP)/2*imgH/100;
            left = (detX*zoomH/100)-20;
        }
        if (imgW < imgH && detW === detH){
            maxP = (imgW-40)*100/imgH;
            zoomH = maxP*100/(detH*100/imgH);
            top = (detY*zoomH/100)-20;
            left = (detX*zoomH/100)-(100-maxP)/2*imgH/100;
        }

        // ritorna [spostamento dall'alto, spostamento da sinistra, ingrandimento in larghezza, ingrandimento in altezza]
        return [-top , -left, zoomW, zoomH];
    }

    var transform = getScale();
    if (transform[3] === 0 ) {
        canvas.animate(transform[0], transform[1], transform[2]/100*$imgWrap.width());
    }
    else {
        canvas.animate(transform[0], transform[1], transform[3]/100*$imgWrap.height());
    }

    // update info
    $('#canvasInfo').text('Clicca l\'immagine per tornare all\'opera completa');
    $('#title').html($('#title h2').html($('#name').text(detail.nome)));
    $('#description').text(detail.descrizione);
};

// highlight searched text or special artwork information or show detail
var $textWrap = $('#info');
var original;
$('#searchBox input')
    .on('keyup', function(){
        $textWrap.html(original);

        var details = Opera[operaID].dettagli;
        var word = $(this).val().replace(/[^a-zA-Z0-9]/g, "").toLowerCase(); // input string
        // if looking for a detail, show it immediately
        // FIXME: opening a detail when one is already opened causes the detail to shrink to previous one dimension
        for (var det in details) {
            if (word === details[det].nome.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()) {
                canvas.showDetail(details[det]);
                original = $textWrap.html();
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
        var $description = $textWrap.children('#description');
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
        original = $textWrap.html();
    })
    // restore the original text
    .on('focusout', function () {
        $textWrap.html(original);
        $(this).val('');
    });

// new function that acts like indexOf() but accepts regex
String.prototype.regexIndexOf = function(regex, startpos) {
    var indexOf = this.substring(startpos || 0).search(regex);
    return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
};
