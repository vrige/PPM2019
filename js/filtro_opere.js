var $textInput = $("#searchBox input");
var $filterBox = $('#filterBox');
var $backgroundElements = $('#wrapper').add($('#wrapper').children());

// delete filterBox when clicking out of it
function emptyFilter() {
  $filterBox.empty();
  $filterBox.css('padding', '0');
  $textInput.val('');
  $(this).off('click');
}

function showFilter() {
  var worker = new Worker("js/filterWorker.js");
  worker.postMessage($textInput.val());

  // worker has finished filtering
  worker.onmessage = function (e) {
    console.log(e.data);
    var filtroOpere = e.data;
    $filterBox.empty();
    if (filtroOpere.length) {
      for (var i in filtroOpere) {
        var id = filtroOpere[i];
        var current = Opera[id];
        var $opera = $('<a></a>')
            .attr({
              'class': 'opera',
              'href': 'opera_page.html?opera='+id
            })
            .data('id', id); // save id to retrieve when clicked
        if (current.hasOwnProperty("dettagli") && current.dettagli.length) {
          $opera.css('color', 'yellow');
        }
        $opera.html(current.nome + ', ' + current.artista.nome + ', ' + current.data + ', ' + current.ubicazione.nome);
        $filterBox.append($opera);
      }
    } else {
      $filterBox.html('<span>Nessun risultato</span>');
    }

    $backgroundElements.on('click', function (e) {
      e.stopImmediatePropagation();
      if (e.target.id !== "filterBox" && e.target.id !== "searchBox" && e.currentTarget.id !== "searchBox")
        emptyFilter();
    });

    worker.terminate();
  };
}

$textInput.on('keyup', showFilter)
    .on('focus', function () {
      $('#filterBox').css('width', '80%');
      $(this).trigger('keyup');
    });