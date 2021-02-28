const motif = require("../motif.js");

describe( "Motif", () => {
    before( () => {
        console.log( "before executes once before all tests" );
    } );

    after( () => {
        console.log( "after executes once after all tests" );
    } );

    describe( "motifs", () => {
        beforeEach( () => {
            console.log( "beforeEach executes before every test" );
        } );

        it( "first motif", () => {
            lexer = motif.motif.lexer;
            lexer.readTextBlock("***** **** *** ** *");
            assert.equal(motif.motif.motifs.length, 1);
            for (var i = 0; i < 5; i++)
                assert.equal(motif.motif.motifs[0][i], i+1);
        } );

        // it( "should return 0 when adding zeros", () => {
        //     assert.equal( calc.add( 0, 0 ), 0 );
        // } );
        
    } );

} );
