
# MOTIF

Motif is a stack-based language where code is defined by the variation in text from one line to the next.

Code is written in bytes, characters, or other data. There is no default inscription. Only the pattern of words and motifs determine meaning. This UI represents Motif code in characters.

Each motif has a unique (prime) number of words. The first time a motif is written, it creates a stack or an action. Variations of that motif -- e.g. reversing, rotating, or extending the words -- are command that affect the relevant stack or apply the action in a new way.

The interpreter hates boring code and will not process programs that lack visual interest.

Motifs are written right-to-left; responses left-to-right.

# VARIATIONS (this will change)

* **MOTIF** = original (ESTABLISH MOTIF, SET NEW MOTIF)
* **PUSH** (add the new things to the stack) = original with more at end (new things at the end)
* **REVERSE** = reverse
* **MUL** = extend all
* **DIV** = shorten all (except 1s)
* **SWAP / ROT** (number of items determined by how many rotations in the code) = cycle (begin with a different one and wrap)
* **ADD** = double one word
* **SUB** = double two-word phrase
* **DROP** = missing last word
* **DUP** = whole thing twice
* **PUSH** (from Input) = original with something new (different size from first item) in front

any block with three or more characters is a variable
other blocks have no particular meaning

# Contributing

* Please make changes in the src folder. Generate a new motif.js file with `grunt build`
