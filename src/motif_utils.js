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

motif.RuntimeError = function(message) {
    this.message = message;
    this.toString = function() {
        return "RUNTIME ERROR: " + this.message;
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
    NEWSTACK: motif.TokenTypes.SETMOTIF,
    ROT: motif.TokenTypes.ROTATED,
    // MOT: motif.TokenTypes.MOTIF,
    // PUSH: motif.TokenTypes.NEW_WORDS_END,
    // EMIT: motif.TokenTypes.REVERSED,
    // MUL: motif.TokenTypes.EXTENDED,
    // DIV: motif.TokenTypes.SHORTENED,
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

