const TOKEN = /,[0-9]+;/g;
type PATTERN = string;
type VALUE = any;
type RHS = (...args: VALUE[]) => any;
type MATCH = [PATTERN, RHS];
type MATCH_STMNT = MATCH[];
type INPUT = string;
type ARGV = string | undefined

export const _ = "ELSE_CASE";

/**
 * Search for instances of value tokens in
 * the string s and replace them with regex
 * wildcard capture groups
 */
function detokenize(s: string): string {
    let result = s;
    while (result.search(TOKEN) > 0) {
        result = result.replace(TOKEN, '(.+)')
    }
    return result;
}

function preprocess(p: string) {
    return p.replace('\\,', ',').replace('\\;', ';');
}

/**
 * 
 * @param s tokens follow the regular expression above
 * and must be of the form ,<number>;
 * ',' and ';' are therefore reserved and must be double
 * escaped (e.q. \\;) to be recoqnized by the matcher 
 * @param m 
 */
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
            let argixs: number[] = [];
            let tokenMatch: RegExpExecArray | null;
            while ((tokenMatch = TOKEN.exec(p)) !== null) {
                const tokenLen = tokenMatch[0].length;
                const argi: number = Number(
                    tokenMatch[0].substr(1,tokenLen - 2));
                argixs.push(argi);
            }
            const mchStr: string = preprocess(detokenize(p));
            console.log(mchStr);
            const inputMatch = new RegExp(mchStr).exec(s);
            if (inputMatch) {
                let args: ARGV[] = argixs.map((i) => undefined)
                let vix = 0;
                while (vix < argixs.length) {
                    const v = inputMatch[vix + 1];
                    const argix = argixs[vix];
                    args[argix - 1] = v;
                    vix++;
                }
                outcome = () => r(...args);
            } else {
                i++; // check other matches
            }
        }
    }
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

console.log("---Escape case");

match("my name is Rowan and I'm 21 years old,22;", [
    ["my name is ,2; and I'm ,1; years old\\,22\\;", 
        (age, name) => { 
            console.log(name); 
            console.log(age); 
        }]
]);
