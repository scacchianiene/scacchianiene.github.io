/* Pagina "Iscritti": disegna le tabelle a partire da assets/dati/iscritti.js */
(function () {
  "use strict";
  // Lingua della pagina: i testi fissi si scelgono con T(italiano, inglese); i dati con L(oggetto, campo),
  // che usa il campo "<nome>_en" se esiste e la pagina e' in inglese.
  var EN = document.documentElement.lang === "en";
  function T(it, en) { return EN ? en : it; }
  function L(o, k) { return EN && o[k + "_en"] ? o[k + "_en"] : o[k]; }
  function turnoN(n) { return EN ? "round " + n : n + "° turno"; }
  var dati = window.ISCRITTI;
  var zona = document.getElementById("iscritti");
  if (!dati || !zona) return;

  function el(tag, attributi, figli) {
    var n = document.createElement(tag);
    Object.keys(attributi || {}).forEach(function (k) {
      if (k === "testo") n.textContent = attributi[k]; else n.setAttribute(k, attributi[k]);
    });
    (figli || []).forEach(function (f) { n.appendChild(f); });
    return n;
  }

  var totale = 0;
  dati.open.forEach(function (o) {
    var giocatori = o.giocatori.slice().sort(function (a, b) { return (b.elo || 0) - (a.elo || 0); });
    totale += giocatori.length;
    var corpo = el("tbody");
    giocatori.forEach(function (g, i) {
      corpo.appendChild(el("tr", {}, [
        el("td", { class: "num", testo: String(i + 1) }),
        el("td", { testo: g.titolo || "" }),
        el("td", { class: "vince", testo: g.nome }),
        el("td", { class: "cifra", testo: g.elo ? String(g.elo) : "–" }),
        el("td", { testo: g.fed || "" }),
        el("td", { testo: g.prov || "" })
      ]));
    });
    if (!giocatori.length) {
      corpo.appendChild(el("tr", {}, [el("td", { colspan: "6", testo: T("Ancora nessun iscritto.", "No entries yet.") })]));
    }
    var tabella = el("table", { class: "accoppiamenti iscritti" }, [
      el("thead", {}, [el("tr", {}, [
        el("th", { scope: "col", testo: "N." }), el("th", { scope: "col", testo: T("Titolo", "Title") }),
        el("th", { scope: "col", testo: T("Giocatore", "Player") }), el("th", { scope: "col", class: "cifra", testo: "Elo" }),
        el("th", { scope: "col", testo: "Fed." }), el("th", { scope: "col", testo: "Prov." })
      ])]),
      corpo
    ]);
    zona.appendChild(el("div", { class: "torneo-open" }, [
      el("h3", { testo: o.nome + ", " + o.fascia + " (" + giocatori.length + ")" }),
      tabella
    ]));
  });
  document.getElementById("iscritti-totale").textContent = String(totale);
  document.getElementById("iscritti-data").textContent = L(dati, "aggiornato");
})();
