const motif = require("../motif.js");
const assert = require("assert");

let lexer;
let has_error;

function compareMotifs(motif, match) {
    for(let i = 0; i < motif.length; i++) {
        assert(motif[i] == match[i]);
    }
}

function writeCode(content, cursorMove = false, isNewLine = true) {
    console.log(content);
}

function writeResponse(content, error = false) {
    console.log(content);
    has_error = error;
}

describe( "Motif", () => {
    // before( () => {
    //     lexer = motif.motif.lexer;
    // } );

    // after( () => {
    // } );

    describe( "initial motifs", () => {
        beforeEach( () => {
            has_error = false;
        } );

        it("three-part motif", () => {
            lexer = new motif.motif.lexer(writeCode, writeResponse);
            lexer.readTextBlock("**************** ** *");
            assert(lexer.motifs.length === 1);
            compareMotifs(lexer.motifs[0], [1,2,16])
        } );

        it("five-part motif", () => {
            lexer = new motif.motif.lexer(writeCode, writeResponse);
            lexer.readTextBlock("***** **** *** ** *");
            assert(lexer.motifs.length === 1);
            compareMotifs(lexer.motifs[0], [1,2,3,4,5])
        } );

        it("non-prime motif", () => {
            lexer = new motif.motif.lexer(writeCode, writeResponse);
            lexer.readTextBlock("***** **** *** ** * *****");
            assert(lexer.motifs.length === 0);
            assert(has_error == true);
        } );

    } );

} );
