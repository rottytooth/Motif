
motif.runtime = function(updateStacks, updateOutput) {
    
    this.stacks = [];

    this.execute = function(token) {
        switch (getKeyByValue(motif.Commands, token.tokentype)) {
            case "NEWSTACK":
                this.addStack(token.blocklist);
                break;
            case "ROT":
                this.rotate(token.stack, token.arguments);
                break;
            case "ADD":
                this.add(token.stack, token.arguments);
        }
        console.log(token);
    }

    const getKeyByValue = (object, value) => {
        return Object.keys(object).find(key => object[key] === value);
    }

    this.addStack = function(startState) {
        this.stacks.push(startState);
        updateStacks();
    }

    this.rotate = function(s, num_items_to_rotate) {
        // for num_items_to_rotate: SWAP = 1, ROT = 2
        if (num_items_to_rotate > this.stacks[s].length) {
            throw new RuntimeError("Could not rotate more than # of items in the stack");
        }
        rotstack = this.stacks[s].splice(0, num_items_to_rotate + 1);
        rotstack = rotstack.slice().rotate(1);
        this.stacks[s] = rotstack.concat(this.stacks[s]);

        updateStacks();
    }

    this.add = function(s, values) {
        for(let i = 0; i < values.length; i++) {
            if (values[i] != 0) {
                if (i >= this.stacks[s].length) {
                    throw new RuntimeError("Attemped to change size of word " + i + " in stack" + motif.GetStackName(s) + " with only " + this.stacks[s].length + " items");
                }
                this.stacks[s][i] += values[i];
            }
        }
        updateStacks();
    }
}

if (typeof module !== 'undefined') {
    module.exports = {
        motif : motif
    }
}
