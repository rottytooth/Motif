const motif = require("../motif.js");
const assert = require("assert");

let lexer;
let runtime;
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

function updateStacks() {

}

function updateOutput(content) {

}

describe( "Runtime tests", () => {
    // before( () => {
    //     lexer = motif.motif.lexer;
    // } );

    // after( () => {
    // } );

    describe( "creating stacks", () => {
        beforeEach( () => {
            has_error = false;
        } );

        it("one stack", () => {
            runtime = new motif.motif.runtime(updateStacks, updateOutput);
            lexer = new motif.motif.lexer(writeCode, writeResponse, runtime);

            lexer.readTextBlock("*** ** *");

            assert(runtime.stacks.length === 1);
            compareArrays(runtime.stacks[0], [1,2,3]);
        });

        it("two stacks", () => {
            runtime = new motif.motif.runtime(updateStacks, updateOutput);
            lexer = new motif.motif.lexer(writeCode, writeResponse, runtime);

            lexer.readTextBlock("*** ** *");
            lexer.readTextBlock("************* * *** ** ****");

            assert(runtime.stacks.length === 2);
            compareArrays(runtime.stacks[0], [1,2,3]);
            compareArrays(runtime.stacks[1], [4,2,3,1,13]);
        });
    });
    describe("stack manipulation", () => {
        beforeEach( () => {
            has_error = false;
        } );

        it("simple addition", () => {
            runtime = new motif.motif.runtime(updateStacks, updateOutput);
            lexer = new motif.motif.lexer(writeCode, writeResponse, runtime);

            lexer.readTextBlock("*** ** *");
            lexer.readTextBlock("* * *******");

            assert(runtime.stacks.length === 1);
            compareArrays(runtime.stacks[0], [7,1,1]);
        });

        it("addition with two stacks", () => {
            runtime = new motif.motif.runtime(updateStacks, updateOutput);
            lexer = new motif.motif.lexer(writeCode, writeResponse, runtime);

            lexer.readTextBlock("***** **** *** ** *");
            lexer.readTextBlock("*** ****** * * *******");
            lexer.readTextBlock("*** * ** ******** * ** *");
            lexer.readTextBlock("* ** *** ** * ** *");

            assert(runtime.stacks.length === 2);
            compareArrays(runtime.stacks[0], [7,1,1,6,3]);
            compareArrays(runtime.stacks[1], [1,2,1,2,3,2,1]);
        });

        it("rotation (rot)", () => {
            runtime = new motif.motif.runtime(updateStacks, updateOutput);
            lexer = new motif.motif.lexer(writeCode, writeResponse, runtime);

            lexer.readTextBlock("***** **** *** ** *");
            lexer.readTextBlock("** * ***** **** ***");

            assert(runtime.stacks.length === 1);
            compareArrays(runtime.stacks[0], [2,3,1,4,5]);
        });

        it("two stacks, one goes to all ones", () => {
            runtime = new motif.motif.runtime(updateStacks, updateOutput);
            lexer = new motif.motif.lexer(writeCode, writeResponse, runtime);

            lexer.readTextBlock("***** ** *");
            lexer.readTextBlock("** * *****");
            lexer.readTextBlock("****** * *** ***** *****");
            lexer.readTextBlock("***** ***** ****** * ***");
            lexer.readTextBlock("* ***** **");
            lexer.readTextBlock("******* * **");
            lexer.readTextBlock("* * * * *");

            assert(runtime.stacks.length === 2);
            compareArrays(runtime.stacks[0], [6,1,3]);
            compareArrays(runtime.stacks[1], [1,-1,3,1,1]);
        });
    });
});
