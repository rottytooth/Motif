
motif.runtime = function(updateStacks, updateOutput) {
    
    this.stacks = [];

    this.execute = function(token) {
        switch (getKeyByValue(motif.Commands, token.tokentype)) {
            case "NEWSTACK":
                this.addStack(token.blocklist);
                break;
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
}

if (typeof module !== 'undefined') {
    module.exports = {
        motif : motif
    }
}
