
var lexer, runtime;

var stack_list = [];

// OLD:
// var palette = [
//     "#382b69",
//     "#4f3a00",
//     "#7e3722",
//     "#4c4a36",
//     "#7f3f74",
//     "#825318",
//     "#70628e",
//     "#747053",
//     "#5e952b",
//     "#a96946", // might be the one to cut
//     "#7abfc7",
//     "#6fa781",
//     "#9a966f",
//     "#bcc149",
//     "#9bcd58",
//     "#000000"
//     ];

var palette = [
    "#352e3e",
    "#453a0a",
    "#68421c",
    "#484635",
    "#684852",
    "#72591d",
    "#69616d",
    "#6d6a52",
    "#748e37",
    "#8e6d3e",
    "#99b8a9",
    "#85a07c",
    "#989572",
    "#bdbe5b",
    "#adc563",
    "#000000"
    ];

function placeCursor(add_space) {
    var oldcursors = document.getElementsByClassName("blinking-cursor");
    for (var i = oldcursors.length - 1; i >= 0; i--) {
        oldcursors[i].remove();
    }

    let currBlock = document.getElementById("main").lastChild;
    if (add_space) {
        let space = document.createElement('span');
        space.className = "sep_block"; // spacer
        space.innerText = " ";
        currBlock.appendChild(space);
    }
    let cursor = document.createElement('span');
    cursor.setAttribute("class","blinking-cursor");
    cursor.innerText = "\u2502";
    currBlock.appendChild(cursor);

    currBlock.scrollIntoView();
}


function writeCode(content, cursorMove = false, isNewLine = true) {

    document.getElementById("main");
    var newDiv = document.createElement("div");
    newDiv.className = "code_block";

    let is_first = true;

    content.split(" ").forEach(element => {
        if (element.length > 0) {
            if (!is_first) {
                let spacer = document.createElement("div");
                spacer.className = "sep_block"; // spacer
                newDiv.appendChild(spacer);
            }
            is_first = false;

            let currword = document.createElement("div");
            currword.classList.add('word');
            currword.innerText = element.length;
            currword.style.width = element.length * 20 + "px";
            newDiv.appendChild(currword);
        }
    });

    if (!isNewLine) {
        main.removeChild(main.lastChild);
    }

    if (main.childElementCount % 2 != 0) {
        var spacer = document.createElement("span");
        spacer.className = "sep_block"; // spacer
        main.appendChild(spacer);
    }

    main.appendChild(newDiv);
    if (cursorMove) placeCursor(content.slice(-1) == " ");
}

function writeResponse(content, token, error = false) {
    // if there's a new response, then let's check that the code block has been formatted

    let main = document.getElementById("main");
    var resp_div = document.createElement("div");
    resp_div.className = "resp_block";
    if (error) {
        resp_div.classList.add("error");
        let last_code_block = main.children[main.children.length - 1];
        let numbers = Array.from(last_code_block.children).filter(x => x.className == "word").map(x => x.innerText);
        last_code_block.innerHTML = "";
        if (last_code_block.className == "code_block") {
            writeBlocks(main.children[main.children.length - 1], token, ["var(--main-blue)"], numbers, 0);
        }
    } else {

        if (token.tokentype == motif.TokenTypes.SETMOTIF) {
            
            // we are adding a new stack
            stack_list.push({
                name: token.stackname,
                size: token.blocklist.length,
                start: stack_list.reduce((p, a) => p + a.size, 0) % palette.length
            });
        }
        let last_code_block = main.children[main.children.length - 1];
        let numbers = [];
        let curr_stack = stack_list.find(x => x.name == token.stackname);

        if (last_code_block.className == "code_block") {
            let code = last_code_block.innerText;
            let curr_word = 0;

            let numbers = Array.from(last_code_block.children).filter(x => x.className == "word").map(x => x.innerText);
            last_code_block.innerHTML = "";

            let rot_offset = 0;

            let palette_to_use = palette.slice(curr_stack.start, curr_stack.start + curr_stack.size);

            if (palette_to_use.length < curr_stack.size) {
                let extra = curr_stack.size - palette_to_use.length;
                palette_to_use = palette_to_use.concat(palette.slice(0, extra));
            }

            if (token.tokentype == motif.TokenTypes.ROTATED) {
                rot_offset = token.arguments;
            }
            if (token.tokentype == motif.TokenTypes.REVERSED) {
                palette_to_use = palette_to_use.reverse();
            }
            writeBlocks(last_code_block, token, palette_to_use, numbers, rot_offset);
        }
    }
    resp_div.innerHTML = content;

    if (main.childElementCount % 2 == 0) {
        var spacer = document.createElement("span");
        spacer.className = "sep_block"; // spacer
        main.appendChild(spacer);
    }

    main.appendChild(resp_div);
}

function writeBlocks(last_code_block, token, palette, numbers, rot_offset) {
    let n = 0;
    numbers.forEach(element => {
        if (n > 0) {
            let sep_div = document.createElement("span");
            sep_div.className = "sep_block";
            sep_div.innerText = " ";
            last_code_block.appendChild(sep_div);
        }
        let stack_div = document.createElement("div");
        stack_div.className = "color_block";
        stack_div.style.backgroundColor = palette[(n + rot_offset) % palette.length];
        stack_div.style.boxShadow = "0 0 2px " + palette[(n + rot_offset) % palette.length];
        stack_div.innerText = element;
        last_code_block.appendChild(stack_div);
        n++;
    });
    
}

// current state of stacks
function updateStacks() {
    let stackbox = document.getElementById("stacks");
    let text = "STACKS<br/><br/>";
    for(let i = 0; i < runtime.stacks.length; i++) {
        text += motif.GetStackName(i) + " [";
        for(let j = 0; j < runtime.stacks[i].length; j++) {
            if (j > 0) text += " ";
            text += runtime.stacks[i][j];
        }
        text += "]<br/>";
    }
    stackbox.innerHTML = text;
}

// output from the program
function updateOutput(content) {
}

function syncScroll(element1, element2) {
    element1.addEventListener('scroll', () => {
        // element2.scrollTo(0,100);
        updateBurnIn();
        element2.scrollTo({
            top: element1.scrollTop,
            left: 0,
            behavior: "instant"
        });
    });
}

function updateBurnIn() {
    // Recursive function
    function traverseBody(node) {
        if (node.childNodes.length) {

        // Loop over every child node
        node.childNodes.forEach(child => {
            if (child.id != null && child.id != "") {
                child.id = child.id + "_bn";
            }

            // If it's a type 1, call the function recursively
            if (child.nodeType == 1) {
                traverseBody(child);
            }
        });
        }
    }
    var content_bn = document.createElement("div");
    content_bn.className = "content";
    content_bn.innerHTML =  content.innerHTML;
    cover_burnin.innerHTML = "";
    cover_burnin.appendChild(content_bn);
    traverseBody(cover_burnin);
    document.querySelector("#main_holder_bn").scrollTop = document.querySelector("#main_holder").scrollTop;
}

window.onload = function(e) {
    document.addEventListener('keypress', logKey);
    document.addEventListener('keydown', stopKeyProp)
    document.addEventListener('paste', readPastedCode)

    runtime = new motif.runtime(updateStacks, updateOutput);
    lexer = new motif.lexer(writeCode, writeResponse, runtime);

    writeCode("");
    placeCursor();

    updateBurnIn();

    syncScroll(document.querySelector("#main_holder"), document.querySelector("#main_holder_bn"));
};

function stopKeyProp(e) {
    if (e.keyCode === 8) { // 8 = backspace
        lexer.readCharacter(e, "main"); // handle backspace here bc won't make it to logKey
        e.preventDefault();
        updateBurnIn();
    }
}
function logKey(e) {
    lexer.readCharacter(e, "main");
    e.preventDefault();
    updateBurnIn();
}
function readPastedCode(e) {
    let paste = (e.clipboardData || window.clipboardData).getData('text');
    lexer.readTextBlock(paste, "main");
    updateBurnIn();
}

