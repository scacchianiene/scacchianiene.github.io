/* Iscritti al torneo, letti da Vesus. Solo dati pubblici: nome, titolo, Elo, federazione, provincia.
   Mai telefono, email, anno di nascita o pagamenti. */
window.ISCRITTI = {
  aggiornato: "14 novembre 2026", aggiornato_en: "14 November 2026",
  open: [
    { nome: "Open A", fascia: "ELO ≥ 1900", giocatori: [
      { nome: "Sforza Michelangelo", titolo: "CN", elo: 1993, fed: "ITA", prov: "BO" },
      { nome: "Manni Cristian", titolo: "1N", elo: 1955, fed: "ITA", prov: "RM" },
      { nome: "Bogacheva Nikol", titolo: "WCM", elo: 1892, fed: "ITA", prov: "RM" }
    ] },
    { nome: "Open B", fascia: "ELO 1700-2000", giocatori: [
      { nome: "Mashrqui Kerolos Moheb George Hana", titolo: "2N", elo: 1722, fed: "ITA", prov: "RM" }
    ] },
    { nome: "Open C", fascia: "ELO < 1700", giocatori: [
      { nome: "Cassanese Gianluca", titolo: "", elo: 1399, fed: "ITA", prov: "RM" }
    ] }
  ]
};
