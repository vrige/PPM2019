var opera = Opera[operaID];
var $img;

var canvas = {
    element: $(document.createElement('canvas'))
        .attr('class', 'operaCanvas')
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
    animate: function (t, l, w, fromSearch, h) {
        if (h === undefined)
            h = false;
        if (fromSearch === undefined)
            fromSearch = false;
        else if (fromSearch) // remove the top canvas if coming from the search bar to show the animation
            $('#topCanvas').remove();
        var betterImg = new Image(); // FIXME: does it get downloaded multiple times when clicking on multiple details?
        if (!this.inDetail || fromSearch) {
            this.inDetail = true;
            betterImg.src = "./img/opere/"+opera.img+"."+imgType;
            $(betterImg).on('load', function () {
                if (!h) {
                    canvas.element.animate({
                        top: t,
                        left: l,
                        width: w
                    }, 350, changeImg);
                } else {
                    canvas.element.animate({
                        top: t,
                        left: l,
                        height: w
                    }, 350, changeImg);
                }
            });
        } else {
            this.inDetail = false;
            $('#topCanvas').remove(); // remove the top canvas to zoom out
            if (!h) {
                canvas.element.animate({
                    top: t,
                    left: l,
                    width: w
                }, 350);
            } else {
                canvas.element.animate({
                    top: t,
                    left: l,
                    height: w
                }, 350);
            }
        }

        function changeImg() { // draw a better quality image over the canvas when the zoom completes
            var propX = betterImg.width/canvas.element.width();
            var propY = betterImg.height/canvas.element.height();

            var canvasNew = document.createElement("canvas");
            canvasNew.width = canvas.width;
            canvasNew.height = canvas.height;
            $(canvasNew).attr({
                'id': 'topCanvas',
                'class': 'operaCanvas'
            });
            canvasNew.getContext("2d").drawImage(betterImg, -l*propX, -t*propY, canvas.width*propX, canvas.height*propY, 0, 0, canvas.width, canvas.height);
            $imgWrap.append(canvasNew);
        }

    }
};
var $imgWrap = $('#artImage');

$(window).on('load', function () {
    $('#listOfDetails').hide();
    $img = $(document.createElement("img"))
        .attr({
            'id': 'operaImage',
            'src': './img/opere/'+opera.img+'_1024.'+imgType,
            'srcset': './img/opere/'+opera.img+'_360.'+imgType+' 360w, ./img/opere/'+opera.img+'_720.'+imgType+' 720w,  ./img/opere/'+opera.img+'_1024.'+imgType+' 1024w'
        })
        .css('width', '100%');

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
    var $operaInfo = $('#info');
    $operaInfo.data('operaInfo', $operaInfo.html()); // save the art details to restore

    // print a loader while the image is being downloaded;
    // if the opera has no image print it and return
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
    $imgWrap.html($img);

    $img.on('load', function () {
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
                .text('Clicca l\'immagine per mostrare/nascondere gli appunti')
            );
        setBoxHeight();

        showTutorial(currentPage); // wait for the operaWrap to be filled to get the correct position for tutorials
    });


});

function setBoxHeight() {
    // calculate the correct description height to fill the screen
    var $filterBox = $('#filterBox');
    var filterBoxMaxHeight = $('#wrapper').height();
    $filterBox.outerHeight(filterBoxMaxHeight, true);
    $filterBox.css('max-height', filterBoxMaxHeight+'px');
    var descriptionHeight = $('#info').height()-$('#title').height()-parseInt($('#description').css('margin-top'));
    $('#description').css('max-height', descriptionHeight+'px');
    $filterBox.css('height', '');
}

$('#filterBox').on('click', '.operaCanvas', function (e) {
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
        if (canvas.width >= canvas.height)
            canvas.animate(0, 0, canvas.width, false);
        else
            canvas.animate(0, 0, canvas.height, false, 1);
        // restore the opera info
        $('#canvasInfo').text('Clicca l\'immagine per mostrare/nascondere i dettagli');
        var $info = $('#info');
        $info.html($info.data('operaInfo'));
        setBoxHeight();
    } else {
        canvas.toggleDetails();
    }
});

canvas.showDetail = function(detail, fromSearch) {
    if (fromSearch === undefined)
        fromSearch = false;
    var imgW = canvas.width;
    var imgH = canvas.height;
    var detX = detail.x/100*imgW;
    var detY = detail.y/100*imgH;
    var detW = detail.width/100*imgW;
    var detH = detail.height/100*imgH;
    if (detW >= detH)
        detH = detW;
    else
        detW = detH;

    var maxP, zoom = 0, top, left;
    if (imgW >= imgH){
        maxP = (imgH-40)*100/imgW;
        zoom = maxP*100/(detW*100/imgW); // ingrandimento in modo che il dettaglio occupi il maxP% in larghezza dello spazio disponibile
        top = (detY*zoom/100)-20;//centra l'immagine in altezza
        left = (detX*zoom/100)-(100-maxP)/2*imgW/100;//centra l'immagine in larghezza
        canvas.animate(-top, -left, zoom/100*$imgWrap.width(), fromSearch);
    }
    if (imgW < imgH){
        maxP = (imgW-40)*100/imgH;
        zoom = maxP*100/(detH*100/imgH);
        top = (detY*zoom/100)-20;
        left = (detX*zoom/100)-(100-maxP)/2*imgH/100;
        canvas.animate(-top, -left, zoom/100*$imgWrap.height(), fromSearch, 1);
    }

    // update info
    $('#canvasInfo').text('Clicca l\'immagine per tornare all\'opera completa');
    $('#title').html($('#title h2').html($('#name').text(detail.nome)));
    $('#description').text(detail.descrizione);

    setBoxHeight();
};

// TODO: this will be removed, the  searchBox will be only used to search notes titles
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
                canvas.showDetail(details[det], true);
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
                speak($(this).text());
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

$('#readDescBtn').on('click', function (e) {
    e.stopImmediatePropagation();
    if ($(this).attr("data-playing")) {
        synth.cancel();
        $(this)
            .text("Leggi descrizione")
            .removeAttr("data-playing");
    } else {
        speak($('#description').text());
        $(this)
            .html("&nbsp;&nbsp;&nbsp;Ferma lettura&nbsp;&nbsp;&nbsp;")
            .attr("data-playing", "true");
    }
});

$('#annulla').on('click', function(){ //tasto annulla nella modalità prendi appunti
    console.log("cliccato annulla");
    window.location = "../progetto/index.html"; //FIXME: correggere la locazione
});
$('#nonMostraLista').on('click', function(){ //tasto utile, ma che andrà rimosso
    $('#headerDescription').show();
    $('#description').show();
    $('#listOfDetails').hide().empty();
});

var $noteBtn = $('#noteBtn');
$('#listOfDetails').on( 'click', '.a_detail', function (e) {
    //per gli eventi di elementi dinamici serve un wrapper
    e.stopPropagation();
    $noteBtn.html("apri appunto");
    var id = $(this).attr('id') ; //id <a> che contiene il dettaglio
    var $id = $('#' + $(this).attr('id'));
    console.log($id.html());
    sessionStorage.setItem('dettaglioAperto', $id.html());//salviamo il titolo del dettaglio
    //TODO: serve una funzione che ripeschi il giusto oggetto nel sessionStorage tramite il titolo del dettaglio
    //      vedi sessionStorage.getItem('dettaglioAperto')
    //TODO: evidenziare il dettaglio nell'immagine
});
$(document).on('click', function () {
    $noteBtn.html("Prendi appunti");
    sessionStorage.setItem('dettaglioAperto', '');
    //TODO: non dare la possibilà all'utente di creare un dettaglio con titolo vuoto nella modalità prendi appunti
});
$noteBtn.on('click', function(e){ //button "prendi appunti/apri appunto"
    e.stopPropagation();
    if(sessionStorage.getItem('dettaglioAperto') !== ''){
        //TODO: serve una funzione che ripeschi il giusto oggetto nel sessionStorage tramite il titolo del dettaglio
        //      vedi sessionStorage.getItem('dettaglioAperto')
        //TODO: aprire il dettaglio all'utente
    }else{
        window.location = "../progetto/index.html"; //FIXME: mandare l'utente nella modalità prendi annotazioni
    }
});



//////////////////CHIAMATE AJAX///////////////////////////

//////////////////SALVA_DETTAGLIO/////////////////////////
$('#salva').on('click', function(){
    console.log("cliccato salva");

    var $dettaglioo = {x: 8.7, y: 7.7, width: 12.8, height: 24.2, nome: "Toro", descrizione: "Corpo scuro e testa bianc"};
    var $dettaglio = JSON.stringify($dettaglioo);

    var $nickname = sessionStorage.getItem('nickname');

    if(sessionStorage["nickname"]){
        console.log("login valido: " + $nickname);
        $.ajax({
            type: 'POST',
            url: 'https://ppm2020app.000webhostapp.com/query_opereDB.php',
            data: {sender: 'saveDetail', nickname: $nickname, opera: opera.nome, dettaglio: $dettaglio},
            success: function(data) {
                console.dir(data);
                var obj = JSON.parse(data);
                if(obj.alreadyInDB === "true"){
                    $('#textForProblem2').html("dettaglio per quell'opera già esistente");
                    console.log("dettaglio per quell'opera già esistente");

                }else{
                    $('#textForProblem2').html("dettaglio aggiunto correttamente");
                    console.log("nuovo dettaglio aggiunto");
                    $('#mostraLista').trigger('click');
                    //  window.location = "../index.html";   //FIXME: correggere la locazione
                }
            },
            error: function(e){
                console.warn("Failed");
                console.log(e);
            }
        });
    }else {
        console.log("devi fare il login");
        $('#textForProblem2').html("devi fare il login");
    }
});


//////////////////MOSTRA DETTAGLI/////////////////////////
$('#mostraLista').on('click', function(){
    console.log("cliccato su mostraLista");
    var $nickname = sessionStorage.getItem('nickname');

    if(sessionStorage["nickname"]){
        console.log("login valido: " + $nickname);
        $.ajax({
            type: 'POST',
            url: 'https://ppm2020app.000webhostapp.com/query_opereDB.php',
            data: {sender: 'loadDetail', nickname: $nickname, opera: opera.nome},
            success: function(data) {
                console.dir(data);
                $('#headerDescription').hide();
                $('#description').hide();
                $('#listOfDetails').show().empty();
                if(data === "0 results"){
                    console.log("non ci sono dettagli");
                    $('#textForProblem2').html("non ci sono dettagli presenti");
                }else{
                    var obj = JSON.parse(data); //array dei dettagli che verrà pushato nel sessionStorage
                    console.dir(obj);
                    $.each(obj, function( index, value ) {  //value è il dettaglio in formato js object

                        $('#listOfDetails').prepend('<li id="detail_' + index + '">' +
                            '<a href="#" class="a_detail" id="a_detail_' + index + '" ></a></li>');
                        $('#detail_' + index ).append('<span id="descrizione_' + index + '"></span>'); //FIXME: decidere se si vuole visualizzare la descrizione oppure no
                        $('#a_detail_' + index ).html(value.nome);
                        $('#descrizione_' + index ).html(" " + value.descrizione);

                    });
                    //sessionStorage salva delle stringhe ed utilizza come metodo di default toString, quindi se vogliamo passargli un array
                    //di oggetti, dobbiamo passargli un JSON
                    sessionStorage.setItem("dettagli", data);
                    //quando si tira fuori dal sessionStorage, bisgona utilizzare JSON.parse()
                }
            },
            error: function(e){
                console.warn("Fallito il load dei dettagli");
                console.log(e);
            }
        });
    }else {
        console.log("devi fare il login");
        $('#textForProblem2').html("devi fare il login");
        // window.location = "../progetto/login.html"; //FIXME: decidere se reindirizzare l'utente
    }

});


//////////////////MODIFICA DETTAGLIO/////////////////////////
$('#modificaDettaglio').on('click', function(){
    console.log("cliccato su modifica");

    var $modificaa = {old_nome: "Toro" , nome: "TOROOo", descrizione: "Corpo scurooooo e testa bianc"};
    var $modifica = JSON.stringify($modificaa);
    console.dir($modifica);
    var $nickname = sessionStorage.getItem('nickname');

    if(sessionStorage["nickname"]){
        console.log("login valido");
        $.ajax({
            type: 'POST',
            url: 'https://ppm2020app.000webhostapp.com/query_opereDB.php',
            data: {sender: 'modifyDetail', nickname: $nickname, opera: opera.nome, modifica: $modifica},
            success: function(data) {
                console.dir(data);
                var obj = JSON.parse(data);
                if(obj.newNameisInDB === "true"){
                    $('#textForProblem2').html("nuovo nome del dettaglio presente nel DB. Modificare nuovamente il nome");
                    console.log("nuovo nome del dettaglio presente nel DB. Modificare nuovamente il nome");
                }
                else if(obj.oldNameisInDB === "true"){  //il vecchio titolo è presente nel db
                    console.log("titolo del dettaglio presente nel DB");
                    if(obj.modifyNome === "true"){
                        if(obj.modifyDescrizione ==="true"){
                            console.log("nome e descrizione modfiicati");
                            $('#textForProblem2').html("nome e descrizione modificati");
                        }else{
                            console.log("nome dettaglio modfiicato");
                            $('#textForProblem2').html("nome dettaglio modfiicato");
                        }
                    }else {
                        if (obj.modifyDescrizione === "true") {
                            console.log("descrizione dettaglio modificato");
                            $('#textForProblem2').html("descrizione dettaglio modificato");
                        } else {
                            console.log("nome e descrizione modfiicati");
                            $('#textForProblem2').html("nome e descrizione dettaglio sono rimasti uguali");
                        }
                    }
                    $('#mostraLista').trigger('click');
                }else{
                    $('#textForProblem2').html("dettaglio non presente nel DB");
                    console.log("dettaglio non presente nel DB");
                }
            },
            error: function(e){
                console.warn("Failed");
                console.log(e);
            }
        });
    }else {
        console.log("devi fare il login");
        $('#textForProblem2').html("devi fare il login");
    }
});


//////////////////ELIMINA DETTAGLIO/////////////////////////
$('#eliminaDettaglio').on('click', function(){
    console.log("cliccato su elimina");

    var $nome = "TOROOo";//nome del dettaglio

    var $nickname = sessionStorage.getItem('nickname');

    if(sessionStorage["nickname"]){
        console.log("login valido");
        $.ajax({
            type: 'POST',
            url: 'https://ppm2020app.000webhostapp.com/query_opereDB.php',
            data: {sender: 'deleteDetail', nickname: $nickname, opera: opera.nome, nome: $nome},
            success: function(data) {
                console.dir(data);
                var obj = JSON.parse(data);
                if(obj.deleteFromDB === "true"){
                    $('#textForProblem2').html("dettaglio eliminato correttamente");
                    console.log("dettaglio eliminato correttamente");
                    $('#mostraLista').trigger('click');
                }else{
                    $('#textForProblem2').html("problemi nell'eliminare il dettaglio");
                    console.log("problemi nell'eliminare il dettaglio");
                }
            },
            error: function(e){
                console.warn("Failed");
                console.log(e);
            }
        });
    }else {
        console.log("devi fare il login");
        $('#textForProblem2').html("devi fare il login");
    }
});
