(function ($) {
  $.fn.transpose = function (options) {
    var opts = $.extend({}, $.fn.transpose.defaults, options);
    var keys = [
      { name: "Ab", value: 0, type: "F" },
      { name: "A", value: 1, type: "N" },
      { name: "A#", value: 2, type: "S" },
      { name: "Bb", value: 2, type: "F" },
      { name: "B", value: 3, type: "N" },
      { name: "C", value: 4, type: "N" },
      { name: "C#", value: 5, type: "S" },
      { name: "Db", value: 5, type: "F" },
      { name: "D", value: 6, type: "N" },
      { name: "D#", value: 7, type: "S" },
      { name: "Eb", value: 7, type: "F" },
      { name: "E", value: 8, type: "N" },
      { name: "F", value: 9, type: "N" },
      { name: "F#", value: 10, type: "S" },
      { name: "Gb", value: 10, type: "F" },
      { name: "G", value: 11, type: "N" },
      { name: "G#", value: 0, type: "S" },
    ];
    var getKeyByName = function (name) {
      if (name.charAt(name.length - 1) == "m") {
        name = name.substring(0, name.length - 1);
      }
      for (var i = 0; i < keys.length; i++) {
        if (name == keys[i].name) {
          return keys[i];
        }
      }
      return undefined;
    };
    var getChordRoot = function (input) {
      if (
        input.length > 1 &&
        (input.charAt(1) == "b" || input.charAt(1) == "#")
      )
        return input.substr(0, 2);
      else return input.substr(0, 1);
    };
    var getNewKey = function (oldKey, delta, targetKey) {
      var keyValue = getKeyByName(oldKey).value + delta;
      if (keyValue > 11) {
        keyValue -= 12;
      } else if (keyValue < 0) {
        keyValue += 12;
      }
      var i = 0;
      if (
        keyValue == 0 ||
        keyValue == 2 ||
        keyValue == 5 ||
        keyValue == 7 ||
        keyValue == 10
      ) {
        switch (targetKey.name) {
          case "A":
          case "A#":
          case "B":
          case "C":
          case "C#":
          case "D":
          case "D#":
          case "E":
          case "F#":
          case "G":
          case "G#":
            for (; i < keys.length; i++) {
              if (keys[i].value == keyValue && keys[i].type == "S") {
                return keys[i];
              }
            }
          default:
            for (; i < keys.length; i++) {
              if (keys[i].value == keyValue && keys[i].type == "F") {
                return keys[i];
              }
            }
        }
      } else {
        for (; i < keys.length; i++) {
          if (keys[i].value == keyValue) {
            return keys[i];
          }
        }
      }
      return undefined;
    };
    var getChordType = function (key) {
      switch (key.charAt(key.length - 1)) {
        case "b":
          return "F";
        case "#":
          return "S";
        default:
          return "N";
      }
    };
    var getDelta = function (oldIndex, newIndex) {
      if (oldIndex > newIndex) return 0 - (oldIndex - newIndex);
      else if (oldIndex < newIndex) return 0 + (newIndex - oldIndex);
      else return 0;
    };
    var transposeChord = function (selector, delta, targetKey) {
      var el = $(selector);
      var oldChord = unSym(el.text());
      var oldChordRoot = getChordRoot(oldChord);
      var newChordRoot = getNewKey(oldChordRoot, delta, targetKey);
      var newChord = newChordRoot.name + oldChord.substr(oldChordRoot.length);
      el.text(toSym(newChord));
      var sib = el[0].nextSibling;
      if (
        sib &&
        sib.nodeType == 3 &&
        sib.nodeValue.length > 0 &&
        sib.nodeValue.charAt(0) != "/"
      ) {
        var wsLength = getNewWhiteSpaceLength(
          oldChord.length,
          newChord.length,
          sib.nodeValue.length
        );
        sib.nodeValue = makeString(" ", wsLength);
      }
    };
    var getNewWhiteSpaceLength = function (a, b, c) {
      if (a > b) return c + (a - b);
      else if (a < b) return c - (b - a);
      else return c;
    };
    var makeString = function (s, repeat) {
      var o = [];
      for (var i = 0; i < repeat; i++) o.push(s);
      return o.join("");
    };
    var isChordLine = function (input) {
      var tokens = input.replace(/\s+/g, " ").split(" ");
      var parenthesisDepth = 0;
      for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];
        if (/^\(/.test(token)) parenthesisDepth++;
        if (
          parenthesisDepth == 0 &&
          !(
            token.length == 0 ||
            opts.chordRegex.test(token) ||
            /[|:]+/.test(token) ||
            /[-_/.]+/.test(token) ||
            /o\S*/.test(token)
          )
        )
          return false;
        if (/\)$/.test(token)) parenthesisDepth--;
      }
      return true;
    };
    var wrapChords = function (chordLine) {
      return chordLine.replace(/[^\s\u00A0]+/g, function (token) {
        if (token.match(opts.chordRegex)) {
          return token.replace(
            opts.chordReplaceRegex,
            "<span class='c'>$1</span>"
          );
        } else {
          return (
            "<span>" +
            token.replace(
              opts.chordReplaceRegex,
              "</span><span class='c'>$1</span><span>"
            ) +
            "</span>"
          ).replace("<span></span>", "");
        }
      });
    };
    var nbsp = function (line) {
      return $.support.leadingWhitespace ? line : line.replace(/ /g, "\u00A0");
    };
    var blankline = function () {
      return !$.support.leadingWhitespace || $.browser.opera
        ? "<span>\u00A0</span>"
        : "";
    };
    var toSym = function (chordLine) {
      return opts.useFlatSharpSymbols
        ? chordLine.replace(opts.chordReplaceRegex, toSymReplacer)
        : chordLine;
    };
    var toSymReplacer = function (str) {
      return str.replace(/b/g, "\u266d").replace(/\#/g, "\u266f");
    };
    var unSym = function (chordLine) {
      return opts.useFlatSharpSymbols
        ? chordLine.replace(/\u266d/g, "b").replace(/\u266f/g, "#")
        : chordLine;
    };
    return $(this).each(function () {
      var startKey = $(this).attr("data-key");
      if (!startKey || $.trim(startKey) == "") {
        startKey = opts.key;
      }
      if (!startKey || $.trim(startKey) == "") {
        throw "Starting key not defined.";
        return this;
      }
      var currentKey = getKeyByName(startKey);
      function transposeSong(sections, newKeyName) {
        var newKey = getKeyByName(newKeyName);
        if (currentKey.name == newKey.name) {
          return;
        }
        var delta = getDelta(currentKey.value, newKey.value);
        $(sections).each(function (i, el) {
          $("span.c", el).each(function (i, span) {
            transposeChord(span, delta, newKey);
          });
        });
        currentKey = newKey;
      }
      var keyLinks = [];
      $(keys).each(function (i, key) {
        if (currentKey.name == key.name)
          keyLinks.push(
            "<a href='#' class='selected'>" + toSym(key.name) + "</a> "
          );
        else keyLinks.push("<a href='#'>" + toSym(key.name) + "</a> ");
      });
      var name = $(this).attr("transpose-def");
      var sections = $(
        !name
          ? [this]
          : [this].concat($("*[transpose-ref='" + name + "']").toArray())
      );
      var keysHtml = $("<div class='transpose-keys'></div>");
      keysHtml.html(keyLinks.join(""));
      $(this).before(keysHtml);
      var transposeKeys = $(this).prev();
      if (!$.support.leadingWhitespace) $(this).before("<br/><br/>");
      $("a", keysHtml).click(function (e) {
        e.preventDefault();
        transposeSong(sections, unSym($(this).text()));
        $("a", transposeKeys).removeClass("selected");
        $(this).addClass("selected");
        return false;
      });
      sections.each(function (index, el) {
        var output = [];
        var text = unSym($(el).text().replace(/\r\n/g, "\n"));
        var lineSepChar = $.support.leadingWhitespace ? "\n" : "\r";
        var lines = text.split(lineSepChar);
        var line,
          tmp = "";
        for (var i = 0; i < lines.length; i++) {
          line = lines[i];
          if (line.length == 0) output.push(blankline());
          else if (isChordLine(line))
            output.push("<span>" + toSym(wrapChords(nbsp(line))) + "</span>");
          else output.push("<span>" + nbsp(line) + "</span>");
        }
        $(el).html(output.join($.support.leadingWhitespace ? "\n" : "<br/>\r"));
      });
      return this;
    });
  };
  $.fn.transpose.defaults = {
    chordRegex:
      /^[A-G][b\#]?(2|5|6|7|9|11|13|6\/9|7\-5|7\-9|7\#5|7\#9|7\+5|7\+9|7b5|7b9|7sus2|7sus4|add2|add4|add9|aug|dim|dim7|m\/maj7|m6|m7|m7b5|m9|m11|m13|maj7|maj9|maj11|maj13|mb5|m|sus|sus2|sus4)*(\/[A-G][b\#]*(2|5|6|7|9|11|13|6\/9|7\-5|7\-9|7\#5|7\#9|7\+5|7\+9|7b5|7b9|7sus2|7sus4|add2|add4|add9|aug|dim|dim7|m\/maj7|m6|m7|m7b5|m9|m11|m13|maj7|maj9|maj11|maj13|mb5|m|sus|sus2|sus4)*)*$/,
    chordReplaceRegex:
      /([A-G][b\#]?(2|5|6|7|9|11|13|6\/9|7\-5|7\-9|7\#5|7\#9|7\+5|7\+9|7b5|7b9|7sus2|7sus4|add2|add4|add9|aug|dim|dim7|m\/maj7|m6|m7|m7b5|m9|m11|m13|maj7|maj9|maj11|maj13|mb5|m|sus|sus2|sus4)*)(?!\w)/g,
    useFlatSharpSymbols: false,
  };
})(jQuery);
