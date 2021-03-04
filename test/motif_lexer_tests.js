const motif = require("../motif.js");
const assert = require("assert");

let lexer;
let has_error;

function compareArrays(motif, match) {
    for(let i = 0; i < motif.length; i++) {
        assert(motif[i] == match[i]);
    }
}

function writeCode(content, cursorMove = false, isNewLine = true) {
    // console.log(content);
}

function writeResponse(content, error = false) {
    // console.log(content);
    has_error = error;
}

describe( "Lexer tests", () => {
    // before( () => {
    //     lexer = motif.motif.lexer;
    // } );

    // after( () => {
    // } );

    describe( "initial motifs", () => {
        beforeEach( () => {
            has_error = false;
        } );

        it("three-word motif", () => {
            lexer = new motif.motif.lexer(writeCode, writeResponse);
            lexer.readTextBlock("**************** ** *");
            assert(lexer.motifs.length === 1);
            compareArrays(lexer.motifs[0], [1,2,16])
        } );

        it("five-word motif", () => {
            lexer = new motif.motif.lexer(writeCode, writeResponse);
            lexer.readTextBlock("***** **** *** ** *");
            assert(lexer.motifs.length === 1);
            compareArrays(lexer.motifs[0], [1,2,3,4,5])
        } );

        it("thirteen-word motif", () => {
            lexer = new motif.motif.lexer(writeCode, writeResponse);
            lexer.readTextBlock("***** ********* * * ******************** **** *** ***** ************ ** **** ** *");
            assert(lexer.motifs.length === 1);
            compareArrays(lexer.motifs[0], [1,2,4,2,12,5,3,4,20,1,1,9,5])
        } );

        it("symmetric motif", () => {
            lexer = new motif.motif.lexer(writeCode, writeResponse);
            lexer.readTextBlock("* ** *** ** *");
            assert(lexer.motifs.length === 0);
            assert(has_error == true);
            assert(lexer.error.message.includes("symmetrical"));
        } );

        it("non-prime motif", () => {
            lexer = new motif.motif.lexer(writeCode, writeResponse);
            lexer.readTextBlock("***** **** *** ** * *****");
            assert(lexer.motifs.length === 0);
            assert(has_error == true);
            assert(lexer.error.message.includes("prime"));
        } );

        it("one-word motif", () => {
            lexer = new motif.motif.lexer(writeCode, writeResponse);
            lexer.readTextBlock("*****");
            assert(lexer.motifs.length === 0);
            assert(has_error == true);
            assert(lexer.error.message.includes("at least"));
        } );

        it("motif with all words the same length", () => {
            lexer = new motif.motif.lexer(writeCode, writeResponse);
            lexer.readTextBlock("* * * * *");
            assert(lexer.motifs.length === 0);
            assert(has_error == true);
            assert(lexer.error.message.includes("one word"));
        } );

        it("first motif is stack A", () => {
            lexer = new motif.motif.lexer(writeCode, writeResponse);
            lexer.readTextBlock("*** ** *");
            assert(lexer.motifs.length === 1);
            assert(has_error == false);
            assert(lexer.tokens[lexer.tokens.length-1].stackname = 'A');
        } );
    } );

    describe("variations", () => {
        beforeEach( () => {
            has_error = false;
        } );

        it("three word, reversed", () => {
            lexer = new motif.motif.lexer(writeCode, writeResponse);
            lexer.readTextBlock("*** ** *");
            lexer.readTextBlock("* ** ***");
            assert(lexer.motifs.length === 1);
            assert(lexer.tokens.length === 2);
            assert(lexer.tokens[lexer.tokens.length-1].tokentype == "reversed");
        } );

        it("three word, rotate 1", () => {
            lexer = new motif.motif.lexer(writeCode, writeResponse);
            lexer.readTextBlock("*** ** *");
            lexer.readTextBlock("* *** **");
            assert(lexer.motifs.length === 1);
            assert(lexer.tokens.length === 2);
            assert(lexer.tokens[lexer.tokens.length-1].tokentype == "rotate");
            assert(lexer.tokens[lexer.tokens.length-1].arguments == 1);
        } );

        it("three word, rotate 2", () => {
            lexer = new motif.motif.lexer(writeCode, writeResponse);
            lexer.readTextBlock("*** ** *");
            lexer.readTextBlock("** * ***");
            assert(lexer.motifs.length === 1);
            assert(lexer.tokens.length === 2);
            assert(lexer.tokens[lexer.tokens.length-1].tokentype == "rotate");
            assert(lexer.tokens[lexer.tokens.length-1].arguments == 2);
        } );

        it("five word, rotate 1", () => {
            lexer = new motif.motif.lexer(writeCode, writeResponse);
            lexer.readTextBlock("***** **** *** ** *");
            lexer.readTextBlock("* ***** **** *** **");
            assert(lexer.motifs.length === 1);
            assert(lexer.tokens.length === 2);
            assert(lexer.tokens[lexer.tokens.length-1].tokentype == "rotate");
            assert(lexer.tokens[lexer.tokens.length-1].arguments == 1);
        } );
        it("five word, rotate 3", () => {
            lexer = new motif.motif.lexer(writeCode, writeResponse);
            lexer.readTextBlock("***** **** *** ** *");
            lexer.readTextBlock("*** ** * ***** ****");
            assert(lexer.motifs.length === 1);
            assert(lexer.tokens.length === 2);
            assert(lexer.tokens[lexer.tokens.length-1].tokentype == "rotate");
            assert(lexer.tokens[lexer.tokens.length-1].arguments == 3);
        } );

        it("five word, rotate 4", () => {
            lexer = new motif.motif.lexer(writeCode, writeResponse);
            lexer.readTextBlock("***** **** *** ** *");
            lexer.readTextBlock("**** *** ** * *****");
            assert(lexer.motifs.length === 1);
            assert(lexer.tokens.length === 2);
            assert(lexer.tokens[lexer.tokens.length-1].tokentype == "rotate");
            assert(lexer.tokens[lexer.tokens.length-1].arguments == 4);
        } );

        it("eleven word, reversed", () => {
            lexer = new motif.motif.lexer(writeCode, writeResponse);
            lexer.readTextBlock("* ** *** **** ***** ****** ******* ******** ********* ********** ***********");
            lexer.readTextBlock("*********** ********** ********* ******** ******* ****** ***** **** *** ** *");
            assert(lexer.motifs.length === 1);
            assert(lexer.tokens.length === 2);
            assert(lexer.tokens[lexer.tokens.length-1].tokentype == "reversed");
        } );

        it("size change +1", () => {
            lexer = new motif.motif.lexer(writeCode, writeResponse);
            lexer.readTextBlock("* ** *** **** ***** ****** *******");
            lexer.readTextBlock("** ** *** **** ***** ****** *******");
            assert(lexer.motifs.length === 1);
            assert(lexer.tokens.length === 2);
            assert(lexer.tokens[lexer.tokens.length-1].tokentype == "size change");
            compareArrays(lexer.tokens[lexer.tokens.length-1].arguments, [0,0,0,0,0,0,1]);
        } );

        it("size change -1", () => {
            lexer = new motif.motif.lexer(writeCode, writeResponse);
            lexer.readTextBlock("* ** *** **** ***** ****** *******");
            lexer.readTextBlock("* ** *** **** ***** ***** *******");
            assert(lexer.motifs.length === 1);
            assert(lexer.tokens.length === 2);
            assert(lexer.tokens[lexer.tokens.length-1].tokentype == "size change");
            compareArrays(lexer.tokens[lexer.tokens.length-1].arguments, [0,-1,0,0,0,0,0]);
        });

        it("size change -4, -3", () => {
            lexer = new motif.motif.lexer(writeCode, writeResponse);
            lexer.readTextBlock("* ** *** **** *****");
            lexer.readTextBlock("* ** *** * *");
            assert(lexer.motifs.length === 1);
            assert(lexer.tokens.length === 2);
            assert(lexer.tokens[lexer.tokens.length-1].tokentype == "size change");
            compareArrays(lexer.tokens[lexer.tokens.length-1].arguments, [-4,-3,0,0,0]);
        });
    });
});
