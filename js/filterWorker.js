importScripts("listaOpere.js");

// funzione per fare maiuscolo tutto l'input
// utile per i confronti con includes()
function capitalize(s) {
    if (typeof s !== 'string') return '';
    return s.toUpperCase();
}

var opere = [];
for (var id in Opera) {
    // crea lista di tutte le opere
    opere.push(id);
}

onmessage = function (e) {
    console.log(e.data);
    var filtro = capitalize(e.data);
    console.log("filtro: " + filtro);
    var filtroOpere = opere.filter(function (id) {
        /* filter ritorna un array (filtroOpere) che contiene tutti gli elementi
        dell'array (opere) che superano una certa prova
        */
        var opera = Opera[id];
        var titolo = opera.nome.split(" ");
        var artista = opera.artista.nome.split(" ");
        var ubicazione = opera.ubicazione.nome.split(" ");
        var data = opera.data.split("-");
        var res = titolo.concat(artista, ubicazione, data);

        for (var s in res) {
            if (res[s].toUpperCase().startsWith(filtro))
                return opera;
        }
    });
    postMessage(filtroOpere);
};