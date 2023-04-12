var fs = require("fs-extra");
var input = fs.readJsonSync("input.json");


if (!Array.isArray(input)) input = [input];
for (var i = 0; i < input.length; i++) {
  const person = input[i];
  const cfGenerato = codiceFiscale(person);
  console.log(cfGenerato);
}


// FUNZIONE GENERALE PER CREAZIONE CODICE FISCALE 
/// input va inserito nel file JSON "input.json"

function codiceFiscale(data) {
  let cf = "";
  let cognome = extractCognome(data.surname);
  let nome = extractNome(data.name);

  // ANNO E MESE

  let anno = data.year;
  let lastAnno = anno.toString().slice(-2); // prende ultime due cifre anno
  let mese = data.month.toString();
  let mesi = {
    1: "A",
    2: "B",
    3: "C",
    4: "D",
    5: "E",
    6: "H",
    7: "L",
    8: "M",
    9: "P",
    10: "R",
    11: "S",
    12: "T",
  };
  mese = mesi[mese];

  // GIORNO E SESSO

  let giorno = data.day.toString();
  if (giorno.length == 1) {
    giorno = "0" + giorno;
  } // trasforma i "9" in "09"

  let giorno1 = data.day;
  let sesso = data.gender;
  if (sesso == "F") {
    giorno = giorno1 + 40;
  }

  // COMUNI

  let Capolouoghi = {
    "L'Aquila": "A345",
    Potenza: "G942",
    Catanzaro: "C352",
    Napoli: "F839",
    Bologna: "A944",
    Trieste: "L424",
    Roma: "H501",
    Genova: "D969",
    Milano: "F205",
    Ancona: "A271",
    Campobasso: "B519",
    Torino: "L219",
    Bari: "A662",
    Cagliari: "B354",
    Palermo: "G273",
    Firenze: "D612",
    Trento: "L378",
    Perugia: "G478",
    Aosta: "A326",
    Venezia: "L736",
  };
  let comuni = data.birthplace;
  let comune = Capolouoghi[comuni];
  if (typeof comune == "undefined") {
    // PER I PAESI ESTERI Z + CODICE IDENTIFICATIVO PAESE
    comune = "Z" + "129";
  }

  // let letteraMese = extractMese(data.month)
  cf = cognome + nome + lastAnno + mese + giorno + comune;

  // CARATTERE DI CONTROLLO

  let Dispari = {
    0: 1,
    1: 0,
    2: 5,
    3: 7,
    4: 9,
    5: 13,
    6: 15,
    7: 17,
    8: 19,
    9: 21,
    A: 1,
    B: 0,
    C: 5,
    D: 7,
    E: 9,
    F: 13,
    G: 15,
    H: 17,
    I: 19,
    J: 21,
    K: 2,
    L: 4,
    M: 18,
    N: 20,
    O: 11,
    P: 3,
    Q: 6,
    R: 8,
    S: 12,
    T: 14,
    U: 16,
    V: 10,
    W: 22,
    X: 25,
    Y: 24,
    Z: 23,
  };

  let Pari = {
    0: 0,
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    A: 0,
    B: 1,
    C: 2,
    D: 3,
    E: 4,
    F: 5,
    G: 6,
    H: 7,
    I: 8,
    J: 9,
    K: 10,
    L: 11,
    M: 12,
    N: 13,
    O: 14,
    P: 15,
    Q: 16,
    R: 17,
    S: 18,
    T: 19,
    U: 20,
    V: 21,
    W: 22,
    X: 23,
    Y: 24,
    Z: 25,
  };

  let even = "";
  let odd = "";

  let valoreControllo = 0;

  for (let i = 0; i < cf.length; i++) {
    if (i % 2 != 0) {
      // errore perche primo indice zero ( indice pari ma posizione dispari )
      even = cf[i];
      valoreControllo += Pari[even];
    } else {
      odd = cf[i];
      valoreControllo += Dispari[odd];
    }
  }

  valoreControllo = valoreControllo % 26;

  const carattereControllo = String.fromCharCode(65 + valoreControllo); // sfruttiamo ascii lettere maiuscole inziano alla 65 e siccome so che sono sequenziali basta che sommo A maiuscola a valore id controllo

  return cf + carattereControllo;
}

// FUNZIONE PER CONGNOME

/**
 * @param surname {string}
 */

function extractCognome(surname) {
  let cognome = surname
    .toUpperCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\W]/gi, "");
  const letters = extractVocalsCons(cognome);
  let result = "";
  for (let c of letters.cons) {
    if (result.length < 3) {
      // result = result + c è la stessa cosa della linea sotto
      result += c;
    } else {
      break;
    }
  }
  for (let c of letters.vocals) {
    if (result.length < 3) {
      result += c;
    } else {
      break;
    }
  }
  while (result.length < 3) result += "X"; 

  return result;
}

/**
 * @param s {string}
 */

function extractVocalsCons(s) {
  const result = { vocals: [], cons: [] };
  for (let i = 0; i < s.length; i++) {
    const c = s.at(i);
    if (c == "A" || c == "E" || c == "I" || c == "O" || c == "U") {
      result.vocals.push(c);
    } else {
      result.cons.push(c);
    }
  }
  return result;
}

// FUNZIONE PER NOME
// questo modo: se il nome contiene quattro o più consonanti, si scelgono la prima, la terza e la quarta (per esempio: Gianfranco → GFR), altrimenti le prime tre in ordine (per esempio: Tiziana → TZN). Se il nome non ha consonanti a sufficienza, si prendono anche le vocali; in ogni caso le vocali vengono riportate dopo le consonanti (per esempio: Luca → LCU). Nel caso in cui il nome abbia meno di tre lettere, la parte di codice viene completata aggiungendo la lettera X.

function extractNome(name) {
  let nome = name
    .toUpperCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\W]/gi, ""); // metodi per pulire accenti ecc..
  const letters = extractVocalsCons(nome);
  let result = "";
  if (letters.cons.length >= 4)
    return letters.cons[0] + letters.cons[2] + letters.cons[3];
  for (let c of letters.cons) {
    if (result.length < 3) {
      
      result += c;
    } else {
      break;
    }
  }
  for (let c of letters.vocals) {
    if (result.length < 3) {
      result += c;
    } else {
      break;
    }
  }
  while (result.length < 3) result += "X"; 

  return result;
}
