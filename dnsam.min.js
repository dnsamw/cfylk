function handleDivs() {
  document.getElementById("chords-wrapper").innerHTML = "";
  let e = "";
  for (let t = 1; t <= 10; t++) {
    e += "<div id='div" + t + "'></div>";
  }
  document.getElementById("chords-wrapper").innerHTML = e;
}
function boxChecked() {
  let e = document.getElementById("chords-wrapper");
  "flex" !== e.style.display
    ? (e.style.display = "flex")
    : (e.style.display = "none");
  let t = chords_u();
  handleDivs(), generateChords(t);
}
function generateChords(e) {
  let t = e.split(",");
  for (chord of t) {
    let e = t.indexOf(chord) + 1;
    Raphael.chord(
      "div" + e.toString(),
      chord.replace("_m", " min")
    ).element.setSize(100, 100);
  }
}
function chords_u() {
  let e = document.getElementsByClassName("c"),
    t = [];
  for (i of e) {
    let e = i.textContent.split("");
    if (e.length > 1) {
      if (2 === e.length) {
        let n = e.join("").replace("m", " min").replace("7", " 7");
        t.push(n);
      } else if (-1 !== i.textContent.indexOf("maj")) {
        let n = i.textContent.indexOf("maj"),
          l = e.splice(n).join(""),
          o = e.join("") + " " + l;
        t.push(o);
      } else if (-1 !== i.textContent.indexOf("dim")) {
        let n = i.textContent.indexOf("dim"),
          l = e.splice(n).join(""),
          o = e.join("") + " " + l;
        t.push(o);
      } else if (-1 !== i.textContent.indexOf("aug")) {
        let n = i.textContent.indexOf("aug"),
          l = e.splice(n).join(""),
          o = e.join("") + " " + l;
        t.push(o);
      } else if (-1 !== i.textContent.indexOf("sus4")) {
        let n = i.textContent.indexOf("sus4"),
          l = e.splice(n).join(""),
          o = e.join("") + " " + l;
        t.push(o);
      } else if (-1 !== i.textContent.indexOf("sus2")) {
        let n = i.textContent.indexOf("sus2"),
          l = e.splice(n).join(""),
          o = e.join("") + " " + l;
        t.push(o);
      } else if (-1 !== i.textContent.indexOf("sus")) {
        let n = i.textContent.indexOf("sus4"),
          l = e.splice(n).join(""),
          o = e.join("") + " " + l;
        t.push(o);
      } else if (-1 !== i.textContent.indexOf("add9")) {
        let n = i.textContent.indexOf("add9"),
          l = e.splice(n).join(""),
          o = e.join("") + " " + l;
        t.push(o);
      } else if (-1 !== i.textContent.indexOf("m")) {
        let n = i.textContent.indexOf("m"),
          l = e.splice(n).join(""),
          o = e.join("") + " " + l.replace("m", "min");
        t.push(o);
      }
    } else {
      let n = e.join("") + " maj";
      t.push(n);
    }
  }
  return t.filter((e, n) => t.indexOf(e) === n).toString();
}
