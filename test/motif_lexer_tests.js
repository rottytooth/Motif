const motif = require("../motif.js");
const assert = require("assert");
let lexer;

function compareMotifs(motif, match) {
    for(let i = 0; i < motif.length; i++) {
        assert(motif[i] == match[i]);
    }
}

describe( "Motif", () => {
    before( () => {
        lexer = motif.motif.lexer;
    } );

    // after( () => {
    // } );

    describe( "initial motifs", () => {
        // beforeEach( () => {
        // } );

        it( "three-part motif", () => {
            lexer.readTextBlock("**************** ** *");
            assert(motif.motif.motifs.length === 1);
            compareMotifs(motif.motif.motifs[0], [1,2,16])
        } );

        it( "five-part motif", () => {
            lexer.readTextBlock("***** **** *** ** *");
            assert(motif.motif.motifs.length === 1);
            compareMotifs(motif.motif.motifs[0], [1,2,3,4,5])
        } );

    } );

} );
