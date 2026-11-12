
var DEBUG = false; // show no-op messages on the page, rather than only in the console

const CHAR_WIDTH = 20; // px per character in a typed word
const WORD_PADDING = 8; // the word's left padding, outside its width

var lexer, runtime;

var stack_list = [];

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

    if (!isNewLine) {
        main.removeChild(main.lastChild);
    }

    if (main.childElementCount % 2 != 0) {
        var spacer = document.createElement("span");
        spacer.className = "sep_block"; // spacer
        main.appendChild(spacer);
    }

    main.appendChild(newDiv);

    // a word wider than the column is split at the line end, so that it
    // can't stretch the column (it must be in the page to measure the column)
    let style = getComputedStyle(newDiv);
    let room = newDiv.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    let max_chars = Math.max(1, Math.floor((room - WORD_PADDING) / CHAR_WIDTH));

    let is_first = true;

    content.split(" ").forEach(element => {
        if (element.length > 0) {
            if (!is_first) {
                let spacer = document.createElement("div");
                spacer.className = "sep_block"; // spacer
                newDiv.appendChild(spacer);
            }
            is_first = false;

            // only the first piece is a "word": it holds the whole length, and the rest are "word cont"
            for (let start = 0; start < element.length; start += max_chars) {
                let piece = Math.min(max_chars, element.length - start);
                let currword = document.createElement("div");
                currword.className = start == 0 ? "word" : "word cont";
                currword.innerText = start == 0 ? element.length : " "; // blank, but full height
                currword.style.width = piece * CHAR_WIDTH + "px";
                newDiv.appendChild(currword);
            }
        }
    });

    if (cursorMove) placeCursor(content.slice(-1) == " ");
}

function writeResponse(content, token, error = false, noop = false) {
    // if there's a new response, then let's check that the code block has been formatted

    let main = document.getElementById("main");
    var resp_div = document.createElement("div");
    resp_div.className = "resp_block";
    if (error || noop) {
        resp_div.classList.add(error ? "error" : "noop");
        let last_code_block = main.children[main.children.length - 1];
        let numbers = Array.from(last_code_block.children).filter(x => x.className == "word").map(x => x.innerText);
        last_code_block.innerHTML = "";
        if (last_code_block.className == "code_block") {
            writeBlocks(main.children[main.children.length - 1], ["var(--main-blue)"], numbers, 0);
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
        let curr_stack = stack_list.find(x => x.name == token.stackname);

        if (last_code_block.className == "code_block") {
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
            writeBlocks(last_code_block, palette_to_use, numbers, rot_offset);
        }
    }
    if (noop && !DEBUG) {
        console.log(content);
        return;
    }
    resp_div.innerHTML = content;

    if (main.childElementCount % 2 == 0) {
        var spacer = document.createElement("span");
        spacer.className = "sep_block"; // spacer
        main.appendChild(spacer);
    }

    main.appendChild(resp_div);
}

function writeBlocks(last_code_block, palette, numbers, rot_offset) {
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
    stackbox.innerHTML = "<div style='float:left;'>STACKS</div>";
    stackbox.innerHTML += "<div style='float:right; transform: scaleX(-1)'>MOTIFS</div>";

    let text = "";
    for(let i = 0; i < runtime.stacks.length; i++) {
        text += "<div style='float:left; clear: both;'>";
        text += motif.GetStackName(i) + " [";
        for(let j = 0; j < runtime.stacks[i].length; j++) {
            if (j > 0) text += " ";
            text += runtime.stacks[i][j];
        }
        text += "]</div>";

        text += "<div style='float:right; direction:rtl;'>";
        text += `<div style='display: inline-block; transform:scaleX(-1);'>${motif.GetStackName(i)}</div>`;
        let curr_stack = stack_list[i];

        let palette_to_use = palette.slice(curr_stack.start, curr_stack.start + curr_stack.size);

        if (palette_to_use.length < curr_stack.size) {
            let extra = curr_stack.size - palette_to_use.length;
            palette_to_use = palette_to_use.concat(palette.slice(0, extra));
        }

        text += " </div>";
        stackbox.innerHTML += text;
        text = "";

        writeBlocks(stackbox.lastChild, palette_to_use, lexer.motifs[i], 0);
    }
}

// output from the program
function updateOutput(content) {
}

function setupDropdown(id) {
    let dropdown = document.getElementById(id);
    let button = dropdown.querySelector(".dropdown_button");
    let list = dropdown.querySelector(".dropdown_list");
    let options = Array.from(list.children);
    let start_option = list.querySelector("[disabled]");
    let active = null;

    const enabledOptions = () => options.filter(x => !x.hasAttribute("disabled"));

    function setActive(option) {
        if (active) active.classList.remove("active");
        active = option;
        active.classList.add("active");
        active.scrollIntoView({ block: "nearest" });
        button.setAttribute("aria-activedescendant", active.id);
        updateBurnIn();
    }

    function moveActive(by) {
        let enabled = enabledOptions();
        let i = enabled.indexOf(active) + by;
        setActive(enabled[Math.max(0, Math.min(i, enabled.length - 1))]);
    }

    function open() {
        list.hidden = false;
        button.setAttribute("aria-expanded", "true");
        button.focus(); // Safari doesn't focus on click, and the keys need it
        let selected = list.querySelector("[aria-selected='true']");
        setActive(selected.hasAttribute("disabled") ? enabledOptions()[0] : selected);
    }

    function close() {
        if (list.hidden) return;
        list.hidden = true;
        button.setAttribute("aria-expanded", "false");
        button.removeAttribute("aria-activedescendant");
        // hand the keyboard back to the console, or the next enter would reopen the list
        button.blur();
        updateBurnIn();
    }

    function choose(option) {
        let changed = dropdown.dataset.value != option.dataset.value;
        options.forEach(x => x.setAttribute("aria-selected", x == option));
        start_option.toggleAttribute("disabled", option == start_option);
        start_option.setAttribute("aria-disabled", option == start_option);
        button.innerText = option.innerText;
        dropdown.dataset.value = option.dataset.value;
        close();
        if (changed) dropdown.dispatchEvent(new Event("change"));
    }

    button.addEventListener("click", () => list.hidden ? open() : close());
    button.addEventListener("blur", close);

    // keep focus on the button while clicking the list, so that blur doesn't close it first
    list.addEventListener("mousedown", e => e.preventDefault());
    list.addEventListener("mousemove", e => {
        let option = e.target.closest("li:not([disabled])");
        if (option && option != active) setActive(option);
    });
    list.addEventListener("click", e => {
        let option = e.target.closest("li:not([disabled])");
        if (option) choose(option);
    });

    // keys we handle here must not reach the console, so they are stopped on keydown
    button.addEventListener("keydown", e => {
        if (list.hidden) {
            if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(e.key)) {
                e.preventDefault();
                open();
            }
            return;
        }
        switch (e.key) {
            case "ArrowDown": moveActive(1); break;
            case "ArrowUp": moveActive(-1); break;
            case "Home": setActive(enabledOptions()[0]); break;
            case "End": setActive(enabledOptions().pop()); break;
            case "Enter":
            case " ": choose(active); break;
            case "Escape": close(); break;
            default:
                close(); // anything else is meant for the console
                return;
        }
        e.preventDefault();
    });
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

    setupDropdown("load_example");
    document.getElementById("load_example").addEventListener("change", e => {
        let examples = { hello_world: "programs/helloworld.motif" };
        let path = examples[e.currentTarget.dataset.value];
        if (!path) return;
        fetch(path)
            .then(r => r.ok ? r.text() : Promise.reject(new Error(r.status)))
            .then(text => { lexer.readTextBlock(text, "main"); updateBurnIn(); })
            .catch(err => console.error("Could not load example:", err));
    });

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

