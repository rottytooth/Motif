const motif = require("../motif.js");
let lexer;

function writeCode(content, cursorMove = false, isNewLine = true) {
    console.log("CODE: " + content);
}

function writeResponse(content, error = false) {
    console.log("ERROR: " + content);
}

describe( "Motif", () => {
    before( () => {
        lexer = motif.motif.lexer;
        motif.motif.lexer.writeCode = writeCode;
        motif.motif.lexer.writeResponse = writeResponse;
    } );

    after( () => {
        console.log( "after executes once after all tests" );
    } );

    describe( "motifs", () => {
        beforeEach( () => {
            console.log( "beforeEach executes before every test" );
        } );

        it( "first motif", () => {
            lexer.readTextBlock("***** **** *** ** *");
            assert.equal(motif.motif.motifs.length, 1);
            for (var i = 0; i < 5; i++)
                assert.equal(motif.motif.motifs[0][i], i+1);
        } );
        
    } );

} );
