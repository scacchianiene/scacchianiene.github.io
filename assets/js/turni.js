/* Pagina "Turni e risultati": disegna le tabelle a partire dai dati in assets/dati/turni.js */
(function () {
  "use strict";
  // Lingua della pagina: i testi fissi si scelgono con T(italiano, inglese); i dati con L(oggetto, campo),
  // che usa il campo "<nome>_en" se esiste e la pagina e' in inglese.
  var EN = document.documentElement.lang === "en";
  function T(it, en) { return EN ? en : it; }
  function L(o, k) { return EN && o[k + "_en"] ? o[k + "_en"] : o[k]; }
  function turnoN(n) { return EN ? "round " + n : n + "° turno"; }

  function el(tag, attributi, figli) {
    var nodo = document.createElement(tag);
    Object.keys(attributi || {}).forEach(function (k) {
      if (k === "testo") nodo.textContent = attributi[k];
      else nodo.setAttribute(k, attributi[k]);
    });
    (figli || []).forEach(function (f) { if (f) nodo.appendChild(f); });
    return nodo;
  }

  function giocatore(nome, elo, vince) {
    var td = el("td", vince ? { class: "vince" } : {});
    td.appendChild(document.createTextNode(nome));
    if (elo) td.appendChild(el("span", { class: "elo", testo: String(elo) }));
    return td;
  }

  function tabellaOpen(open) {
    var corpo = el("tbody");
    open.accoppiamenti.forEach(function (a) {
      var azione = el("td");
      if (a.partita) {
        azione.appendChild(el("a", { class: "apri", href: "partite.html?p=" + encodeURIComponent(a.partita), testo: T("Guarda la partita", "Watch the game") }));
      }
      corpo.appendChild(el("tr", {}, [
        el("td", { class: "num", testo: a.scacchiera ? String(a.scacchiera) : "–" }),
        giocatore(a.bianco, a.eloB, a.risultato === "1-0"),
        el("td", { class: "ris", testo: a.risultato || "–" }),
        giocatore(a.nero, a.eloN, a.risultato === "0-1"),
        azione
      ]));
    });
    var testa = el("thead", {}, [el("tr", {}, [
      el("th", { scope: "col", testo: T("Sc.", "Bd.") }),
      el("th", { scope: "col", testo: T("Bianco", "White") }),
      el("th", { scope: "col", testo: T("Risultato", "Result") }),
      el("th", { scope: "col", testo: T("Nero", "Black") }),
      el("th", { scope: "col", testo: T("Partita", "Game") })
    ])]);
    return el("div", { class: "torneo-open" }, [
      el("h3", { testo: open.nome }),
      el("table", { class: "accoppiamenti" }, [testa, corpo])
    ]);
  }

  function disegnaTurno(contenitore, turno) {
    contenitore.textContent = "";
    if (!turno.open.length) {
      contenitore.appendChild(el("p", { class: "in-attesa", testo: T("Gli accoppiamenti del " + turno.numero + "° turno saranno pubblicati qui appena disponibili. Inizio: " + turno.quando + ".", "The pairings for round " + turno.numero + " will be published here as soon as they are available. Start: " + L(turno, "quando") + ".") }));
      return;
    }
    turno.open.forEach(function (o) { contenitore.appendChild(tabellaOpen(o)); });
  }

  // Turni del Carnival
  var scelta = document.getElementById("scelta-turno");
  var zona = document.getElementById("turno");
  var turni = window.TURNI_CARNIVAL || [];
  function seleziona(i) {
    Array.prototype.forEach.call(scelta.children, function (b, k) { b.setAttribute("aria-pressed", k === i ? "true" : "false"); });
    disegnaTurno(zona, turni[i]);
  }
  turni.forEach(function (t, i) {
    var b = el("button", { type: "button", "aria-pressed": "false" });
    b.appendChild(document.createTextNode(T(t.numero + "° turno", "Round " + t.numero)));
    b.appendChild(el("small", { testo: L(t, "quando") }));
    b.addEventListener("click", function () { seleziona(i); });
    scelta.appendChild(b);
  });
  if (turni.length) seleziona(0);

  // Esempio dal 13° Torneo
  var es = window.TURNO_ESEMPIO;
  if (es) {
    document.getElementById("esempio-titolo").textContent = L(es, "evento") + ", " + turnoN(es.numero) + " (" + L(es, "quando") + ")";
    disegnaTurno(document.getElementById("esempio"), es);
  }
})();
