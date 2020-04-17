const TOKEN = /,[0-9]+;/g;
type PATTERN = string;
type VALUE = any;
type RHS = (...args: VALUE[]) => any;
type MATCH = [PATTERN, RHS];
type MATCH_STMNT = MATCH[];
type INPUT = string;

export const _ = "ELSE_CASE";

/**
 * Search for instances of value tokens in
 * the string s and replace them with regex
 * wildcards
 */
function detokenize(s: string) {
    let result = s;
    while (result.search(TOKEN) > 0) {
        result = result.replace(TOKEN, ".+")
    }
    return result;
}

export function match(s: INPUT, m: MATCH_STMNT): any {
    let outcome = null;
    let i = 0;
    while (i < m.length && !outcome) {
        let p: PATTERN;
        let r: RHS;
        [p, r] = m[i];
        if (p == _) {
            outcome = () => r();
        } else {
            let tkIdcs: number[] = [];
            let tkLens: number[] = [];
            let argixs: number[] = [];
            let tokenMatch: RegExpExecArray | null;
            while ((tokenMatch = TOKEN.exec(p)) !== null) {
                const tokenLen = tokenMatch[0].length;
                const index: number = tokenMatch.index;
                const argi: number = Number(
                    tokenMatch[0].substr(1,tokenLen - 2));
                tkIdcs.push(index);
                tkLens.push(tokenLen);
                argixs.push(argi);
            }
            const mchStr: string = detokenize(p);
            const inputMatch = new RegExp(mchStr).exec(s);
            if (inputMatch) {
                let args = ["Arg1", "Arg2"];
                // TODO extract arg values (HARD)
                outcome = () => r(...args);
            } else {
                i++; // check other matches
            }
        }
    }
    new RegExp('ab+c');
    if (!outcome) {
        throw new Error(`No match for '${s}'`);
    } else {
        return outcome();
    }
}

console.log("---Match case");

match("my name is Rowan and I'm 21 years old", [
    ["my name is ,2; and I'm ,1; years old", 
        (age, name) => { 
            console.log(name); 
            console.log(age); 
        }],
    [_, () => { console.log("default case"); }]
]);

console.log("---Default case");

match("my name is Rowan and Im 21 years old", [
    ["my name is ,2; and I'm ,1; years old", 
        (age, name) => { 
            console.log(name); 
            console.log(age); 
        }],
    [_, () => { console.log("default"); }]
]);

console.log("---No match case");

match("my name is Rowan and Im 21 years old", [
    ["my name is ,2; and I'm ,1; years old", 
        (age, name) => { 
            console.log(name); 
            console.log(age); 
        }]
]);
