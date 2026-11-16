/* Visualizzatore delle partite.
   Non calcola le mosse: legge le posizioni già preparate in assets/dati/partite.js,
   quindi funziona anche aprendo la pagina con un doppio clic, senza server. */
(function () {
  "use strict";
  // Lingua della pagina: i testi fissi si scelgono con T(italiano, inglese); i dati con L(oggetto, campo),
  // che usa il campo "<nome>_en" se esiste e la pagina e' in inglese.
  var EN = document.documentElement.lang === "en";
  function T(it, en) { return EN ? en : it; }
  function L(o, k) { return EN && o[k + "_en"] ? o[k + "_en"] : o[k]; }
  function turnoN(n) { return EN ? "round " + n : n + "° turno"; }
  // In inglese le iniziali dei pezzi cambiano: C A T D R diventano N B R Q K.
  var PEZZI_EN = { C: "N", A: "B", T: "R", D: "Q", R: "K" };
  function mossa(m) { return EN ? m.replace(/[CATDR]/g, function (c) { return PEZZI_EN[c]; }) : m; }

  var partite = window.PARTITE || [];
  var pezzi = window.PEZZI || {};
  var corrente = null;      // partita aperta
  var passo = 0;            // 0 = posizione iniziale, n = dopo la n-esima semimossa
  var ruotata = false;

  var elScacchiera = document.getElementById("scacchiera");
  var elMosse = document.getElementById("mosse");
  var elLista = document.getElementById("lista");
  var elCerca = document.getElementById("cerca");

  function el(tag, attributi) {
    var n = document.createElement(tag);
    Object.keys(attributi || {}).forEach(function (k) {
      if (k === "testo") n.textContent = attributi[k]; else n.setAttribute(k, attributi[k]);
    });
    return n;
  }

  /* ---- Scacchiera ---- */
  function leggiFen(fen) {
    var case_ = {};
    fen.split("/").forEach(function (riga, r) {
      var c = 0;
      riga.split("").forEach(function (ch) {
        if (/\d/.test(ch)) { c += parseInt(ch, 10); }
        else { case_["abcdefgh"[c] + (8 - r)] = ch; c += 1; }
      });
    });
    return case_;
  }

  function disegnaScacchiera() {
    var posizione = leggiFen(corrente.fens[passo]);
    var da = passo > 0 ? corrente.da[passo - 1] : null;
    var a = passo > 0 ? corrente.a[passo - 1] : null;
    var colonne = "abcdefgh".split("");
    var righe = [8, 7, 6, 5, 4, 3, 2, 1];
    if (ruotata) { colonne.reverse(); righe.reverse(); }
    elScacchiera.textContent = "";
    righe.forEach(function (r, ir) {
      colonne.forEach(function (c, ic) {
        var nome = c + r;
        var scura = ("abcdefgh".indexOf(c) + r) % 2 === 1;
        var casa = el("div", { class: "casa " + (scura ? "scura" : "chiara") + (nome === da || nome === a ? " ultima" : "") });
        if (ic === 0) casa.appendChild(el("span", { class: "coord riga", testo: String(r) }));
        if (ir === 7) casa.appendChild(el("span", { class: "coord colonna", testo: c }));
        var p = posizione[nome];
        if (p && pezzi[p]) {
          casa.insertAdjacentHTML("beforeend", '<svg viewBox="0 0 45 45" aria-hidden="true">' + pezzi[p] + "</svg>");
        }
        elScacchiera.appendChild(casa);
      });
    });
    elScacchiera.setAttribute("aria-label", descriviPosizione());
  }

  function descriviPosizione() {
    if (passo === 0) return T("Posizione iniziale", "Starting position");
    var n = Math.ceil(passo / 2);
    return T("Posizione dopo ", "Position after ") + n + (passo % 2 === 1 ? ". " : "... ") + mossa(corrente.mosse[passo - 1]);
  }

  /* ---- Elenco delle mosse ---- */
  function disegnaMosse() {
    elMosse.textContent = "";
    var coppia = null;
    corrente.mosse.forEach(function (m, i) {
      if (i % 2 === 0) {
        coppia = el("span", { class: "coppia" });
        coppia.appendChild(el("span", { class: "n", testo: (i / 2 + 1) + "." }));
        elMosse.appendChild(coppia);
        elMosse.appendChild(document.createTextNode(" "));
      }
      var b = el("button", { type: "button", testo: mossa(m) });
      b.addEventListener("click", function () { vai(i + 1); });
      coppia.appendChild(b);
    });
  }

  function segnaMossa() {
    var bottoni = elMosse.querySelectorAll("button");
    Array.prototype.forEach.call(bottoni, function (b, i) {
      if (i === passo - 1) {
        b.setAttribute("aria-current", "true");
        var alto = b.offsetTop - elMosse.offsetTop;
        if (alto < elMosse.scrollTop || alto > elMosse.scrollTop + elMosse.clientHeight - 40) elMosse.scrollTop = alto - 60;
      } else b.removeAttribute("aria-current");
    });
  }

  function vai(n) {
    if (!corrente) return;
    passo = Math.max(0, Math.min(corrente.mosse.length, n));
    disegnaScacchiera();
    segnaMossa();
  }

  /* ---- Intestazione e giocatori ---- */
  function scriviGiocatori() {
    var sopra = ruotata ? "bianco" : "nero";
    var sotto = ruotata ? "nero" : "bianco";
    function riga(id, chi) {
      var box = document.getElementById(id);
      box.textContent = "";
      box.appendChild(el("span", { testo: (chi === "bianco" ? T("Bianco: ", "White: ") : T("Nero: ", "Black: ")) + corrente[chi] }));
      var elo = chi === "bianco" ? corrente.eloB : corrente.eloN;
      if (elo) box.appendChild(el("span", { class: "elo", testo: String(elo) }));
    }
    riga("giocatore-sopra", sopra);
    riga("giocatore-sotto", sotto);
  }

  function apri(p) {
    corrente = p; passo = 0;
    document.getElementById("titolo-partita").textContent = p.bianco + " – " + p.nero;
    document.getElementById("dove").textContent = [L(p, "evento"), p.open, turnoN(p.turno), p.data].filter(Boolean).join(", ");
    document.getElementById("risultato").textContent = p.risultato;
    var scarica = document.getElementById("scarica");
    scarica.href = "data:application/x-chess-pgn;charset=utf-8," + encodeURIComponent(p.pgn);
    scarica.setAttribute("download", p.id + ".pgn");
    scriviGiocatori();
    disegnaMosse();
    vai(0);
    Array.prototype.forEach.call(elLista.querySelectorAll("button"), function (b) {
      if (b.dataset.id === p.id) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current");
    });
  }

  /* ---- Elenco delle partite con ricerca ---- */
  function disegnaLista() {
    var filtro = (elCerca.value || "").trim().toLowerCase();
    elLista.textContent = "";
    var visibili = partite.filter(function (p) {
      return !filtro || [p.bianco, p.nero, p.open, L(p, "evento"), turnoN(p.turno)].join(" ").toLowerCase().indexOf(filtro) !== -1;
    });
    if (!partite.length) return;
    if (!visibili.length) {
      elLista.appendChild(el("li", { class: "nessuna", testo: T("Nessuna partita corrisponde alla ricerca. Prova con un altro nome.", "No game matches your search. Try another name.") }));
      return;
    }
    visibili.forEach(function (p) {
      var li = el("li");
      var b = el("button", { type: "button", "data-id": p.id });
      b.appendChild(el("span", { class: "chi", testo: p.bianco + " – " + p.nero }));
      b.appendChild(el("span", { class: "cosa", testo: [p.open, turnoN(p.turno), p.risultato].filter(Boolean).join(", ") }));
      if (corrente && corrente.id === p.id) b.setAttribute("aria-current", "true");
      b.addEventListener("click", function () { apri(p); });
      li.appendChild(b); elLista.appendChild(li);
    });
  }

  /* ---- Comandi ---- */
  document.getElementById("inizio").addEventListener("click", function () { vai(0); });
  document.getElementById("indietro").addEventListener("click", function () { vai(passo - 1); });
  document.getElementById("avanti").addEventListener("click", function () { vai(passo + 1); });
  document.getElementById("fine").addEventListener("click", function () { vai(corrente.mosse.length); });
  document.getElementById("ruota").addEventListener("click", function () { ruotata = !ruotata; scriviGiocatori(); disegnaScacchiera(); });
  elCerca.addEventListener("input", disegnaLista);
  document.addEventListener("keydown", function (e) {
    if (e.target === elCerca) return;
    if (e.key === "ArrowRight") { vai(passo + 1); e.preventDefault(); }
    else if (e.key === "ArrowLeft") { vai(passo - 1); e.preventDefault(); }
    else if (e.key === "Home") { vai(0); e.preventDefault(); }
    else if (e.key === "End") { vai(corrente.mosse.length); e.preventDefault(); }
  });

  /* ---- Avvio: apre la partita indicata nell'indirizzo (?p=...) oppure la prima ---- */
  disegnaLista();
  if (partite.length) {
    var richiesta = new URLSearchParams(window.location.search).get("p");
    var iniziale = partite.filter(function (p) { return p.id === richiesta; })[0] || partite[0];
    apri(iniziale);
  } else {
    // Nessuna partita ancora: resta visibile la struttura, con la scacchiera nella posizione iniziale.
    corrente = { id: "", mosse: [], fens: ["rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"], da: [], a: [], bianco: "", nero: "" };
    passo = 0;
    scriviGiocatori();
    disegnaScacchiera();
    document.getElementById("scarica").hidden = true;
  }
})();
