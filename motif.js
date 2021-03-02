var motif = {};

Array.prototype.rotate = (function() {
    var unshift = Array.prototype.unshift,
        splice = Array.prototype.splice;

    return function(count) {
        var len = this.length >>> 0,
            count = count >> 0;

        unshift.apply(this, splice.call(this, count % len, len));
        return this;
    };
})();


motif.SyntaxError = function(message, linenum, line) {
    this.message = message;
    this.linenum = linenum;
    this.line = line;
    this.toString = function() {
      return "SYNTAX ERROR: " + this.message;
    };
  }

// The set of variations on a motif
motif.TokenTypes = {
    MOTIF: 'motif',
    SETMOTIF: 'set motif',
    ROTATED: 'rotate',
    REVERSED: 'reversed',
    SIZE_CHANGE: 'size change'
};

// The commands and the TokenTypes that signify them
motif.Commands = {
    // MOT: motif.TokenTypes.MOTIF,
    // PUSH: motif.TokenTypes.NEW_WORDS_END,
    // EMIT: motif.TokenTypes.REVERSED,
    // MUL: motif.TokenTypes.EXTENDED,
    // DIV: motif.TokenTypes.SHORTENED,
    // ROT: motif.TokenTypes.ROTATED,
    // ADD: motif.TokenTypes.DOUBLED_WORD,
    // SUB: motif.TokenTypes.DOUBLED_TWO_WORD_PHRASE,
    // DROP: motif.TokenTypes.MISSING_LAST_WORD,
    // INPUT: motif.TokenTypes.DOUBLED,
    // IF
    // WHILE
}

motif.Token = function(tokentype, lexeme, blocklist, linenum, stack, arguments = null) {
    var token = {};
    token.tokentype = tokentype;
    token.lexeme = lexeme;
    token.blocklist = blocklist;
    token.arguments = arguments;
    token.linenum = linenum;
    token.stack = stack;
    token.stackname = String.fromCharCode("A".charCodeAt(0) + stack);

    token.clone = function() {
        return motif.Token(token.tokentype, token.lexeme, token.blocklist, token.linenum, token.stack, token.arguments);
    }
    return token;
}

motif.isPrime = function(value) {
    for(var i = 2; i < value; i++) {
        if(value % i === 0) {
            return false;
        }
    }
    return value > 1;
}


// This is responsible both for lexing and for display to the user
// relevant to lexing (eg syntax errors)
motif.lexer = function(writeCode, writeResponse) { 

    this.tokens = [];

    this.motifs = [];

    let inspace = true; // whether we are currently in a space

    let linenum = 0; // current line number (for reporting results)

    let currentline = "";

    this.program = ""; // this is not currently used, but builds up the whole program

    // When code is pasted in as a block, we have to iterate through it
    // Also, we treat it a bit differently:
    //      * stars are reversed (right to left)
    //      * anything after an | is ignored
    this.readTextBlock = function(input) {
        input.split("\n").forEach((line) => {
            if ((commentloc = line.indexOf("|")) > -1) {
                line = line.substring(0, commentloc);
            }

            // reverse string
            // FIXME: this assumes ltr in clipboard, switching to rtl
            line = line.split("").reverse().join("");

            // call readCharacter() on each char
            line.split('').forEach((chr) => this.readCharacter(chr));
            this.readCharacter("\n"); // read the new line we got rid of by splitting
        });
    }
    
    // Write a single character (as input by user) to the program and to the screen
    // If we are at the end of a line, tokenize that line
    this.readCharacter = function(e) {

        if (e.keyCode && e.keyCode === 8) {
            currentline.slice(0, -1); // backspace
            inspace = false;
            writeToScreen();
            return;
        } 

        if (e.key) e = e.key;

        if (e == " ") {
            if (!inspace) {
                currentline += " ";
            }
            inspace = true
            writeToScreen();
            return;
        } 
        if (e == "\r" || e == "\n" || e.toLowerCase() == "enter") {
            linenum++;
            try {
                this.tokens.push(tokenize(currentline, linenum));
                writeParseBlock(this.tokens[this.tokens.length - 1]);
                currentline += "\n";
                this.program += currentline; // FIXME: this is never used again
                currentline = "";
            } catch(e) {
                currentline = ""; // in case it didn't clear before the error
                if (e instanceof SyntaxError) {
                    if (typeof writeResponse != 'undefined') writeResponse(e, true);
                }
                else {
                    if (typeof writeResponse != 'undefined') writeResponse("Oh shit! Internal Error: " + e, true);
                }
            }
            inspace = true;
            if (typeof writeCode != 'undefined') writeCode("", true); // starts a new line
            return; // we're writing through the writeError() and writeParseBlock(), so no reason to reason to let it get to writeToScreen() below
        } 

        // default: any other character
        currentline += "*";
        inspace = false;
        writeToScreen();
    }

    verifyMotif = (motifblocks, line, linenum) => {
        if (motifblocks.length < 3) {
            throw new SyntaxError("Motif must be at least three words", linenum, line);
        }
        if (motifblocks.every(el => el.length == 1)) {
            throw new SyntaxError("Motif must have at least one word with more than one character");
        }
        if (!motif.isPrime(motifblocks.length)) {
            // is not prime, invalid to be motif
            throw new SyntaxError("Motif must have a prime-number count of words", linenum, line);
        }
        // if (!motifs.every(el => el.length < motifblocks.length - 2 || el.length > motifblocks.length + 2))  {
        //     throw new SyntaxError("Motif must be at least two more or two fewer elements than other motifs");
        // }
        if (JSON.stringify(motifblocks) === JSON.stringify(motifblocks.slice().reverse())) {
            throw new SyntaxError("Motif cannot be symmetrical!");
        }
    } 

    const tokenize = (line, linenum) => {
        line = line.trim();
    
        // Do we have any motif yet? If not, this is the proposed motif
        if (this.motifs.length == 0) {
            const motifblocks = line.split(" ").map(function(word){
                return word.length;
            });
            verifyMotif(motifblocks, line, linenum);
            this.motifs.push(motifblocks);
            return motif.Token(motif.TokenTypes.SETMOTIF, line, motifblocks, linenum, 0);
        }
        const line_lengths = line.split(" ").map(function(word){
            return word.length
        });

        // Loop through established motifs, to see if it is a variation of one
        // m == the (established) motif we are looking at
        for(let m = 0; m < this.motifs.length; m++) {
            // Is it the same number of blocks / same plus one of an existing motif
            if (this.motifs[m].length == line_lengths.length || this.motifs[m].length - 1 == line_lengths.length) {
                
                // Does it match any of our motifs exactly?
                if (JSON.stringify(this.motifs[m]) === JSON.stringify(line_lengths)) {
                    return motif.Token(motif.TokenTypes.MOTIF, line, line_lengths, linenum, m);
                }

                // Is it reversed?
                if (JSON.stringify(this.motifs[m]) === JSON.stringify(line_lengths.slice().reverse())) {
                    return motif.Token(motif.TokenTypes.REVERSED, line, line_lengths, linenum, m);
                }

                // Is it rotated?
                for(let j = 0; j < this.motifs[m].length; j++) {
                    if (JSON.stringify(this.motifs[m].slice().rotate(j)) === JSON.stringify(line_lengths)) {
                        return motif.Token(motif.TokenTypes.ROTATED, line, line_lengths, linenum, m, j);
                    }
                }

                // Are some words longer or shorter (but same number of words)?
                if (this.motifs[m].length == line_lengths.length) { // only if same length
                    let changes = [];
                    for (let j = 0; j < this.motifs[m].length; j++) {
                        changes[j] = line_lengths[j] - this.motifs[m][j];
                    }
                    if (changes.reduce((a, b) => a + b) != 0) { // if sum is not zero
                        return motif.Token(motif.TokenTypes.SIZE_CHANGE, line, line_lengths, linenum, m, changes);
                    }
                }

                // if we go this far, and don't know what it is, it is the right length
                // to be a play on existing motif, but not one we recognize
                throw new SyntaxError("Could not determine command", linenum, line);
            }
        }

        // if we got this far, must be trying to set a new motif
        const motifblocks = line.split(" ").map(function(word){
            return word.length;
        });
        verifyMotif(motifblocks, line, linenum);
        this.motifs.push(motifblocks);
        return motif.Token(motif.TokenTypes.SETMOTIF, line, motifblocks, linenum, this.motifs.length - 1);
    }

    // response from the lexer
    const writeParseBlock = (token) => {
        let content = "";
        content += token.tokentype + " " + token.stackname;
        if (token.tokentype == motif.TokenTypes.SETMOTIF) {
            content += ":" + token.blocklist.join(" ");
        }
        if (token.tokentype == motif.TokenTypes.ROTATED) {
            content += " " + (token.arguments + 1);
            if (token.arguments == 1) {
                content += " (SWAP)";
            }
            else if (token.arguments == 2) {
                content += " (ROT)";
            }
        }
        if (token.tokentype == motif.TokenTypes.SIZE_CHANGE) {
            content += ":";
            let added = false;
            for(let j = 0; j < token.arguments.length; j++) {
                if (token.arguments[j] != 0) {
                    if (added == true)  content += ", ";
                    content += " word " + (j + 1) + " change: " + (token.arguments[j] > 0 ? "+" : "") + token.arguments[j];
                    added = true;
                }
            }
        }
        if (typeof writeResponse != 'undefined') writeResponse(content);
    }

    // output function for left column (user input)
    const writeToScreen = () => {
        let strResponse = "";
        let isNewLine = false;
        
        for (let i = 0; i < currentline.length; i++) {
            switch(currentline[i]) {
                case "*":
                    strResponse += "\u2588"; // block
                    break;
                case " ":
                    strResponse += "\u2003"; // em space
                    break;
                case "\n":
                    isNewLine = true;
                    currentline = "";
                    break;
            }
        }
        if (typeof writeCode != 'undefined') writeCode(strResponse, true, isNewLine);
    }
}


motif.runtime =
(function() {
    
})(motif);


module.exports = {
    motif : motif
}
 