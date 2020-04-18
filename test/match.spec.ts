/**
 * Tests for the primary match function
 */

import { expect } from 'chai';
import 'mocha';
import { match, _ } from '../index';

describe("Match function", () => {

    it("Should correctly match basic tokens", () => {
        let ran = false;
        match("my name is Rowan and I'm 21 years old", [
            ["my name is ,1; and I'm ,2; years old",
                (name, age) => {
                    ran = true;
                    expect(age).to.equal("21");
                    expect(name).to.equal("Rowan");
                }]
        ]);
        if (!ran) {
            expect.fail("Did not run case code");
        }
    });

    it("Should correctly order values based on numeric tokens", () => {
        let ran = false;
        match("my name is Rowan and I'm 21 years old", [
            ["my name is ,2; and I'm ,1; years old",
                (age, name) => {
                    ran = true;
                    expect(age).to.equal("21");
                    expect(name).to.equal("Rowan");
                }]
        ]);
        if (!ran) {
            expect.fail("Did not run case code");
        }
    });

    it("Should match a default case id one is provided", () => {
        let ran = false;
        match("my name is Rowan and Im 21 years old", [
            ["my name is ,2; and I'm ,1; years old",
                (age, name) => { expect.fail("Ran wrong case code"); }],
            [_, () => {
                ran = true;
            }]
        ]);
        if (!ran) {
            expect.fail("Did not run case code");
        }
    });

    it("Should raise an Error if no match is hit", () => {
        try {
            match("my name is Rowan and Im 21 years old", [
                ["my name is ,2; and I'm ,1; years old", 
                    (age, name) => {
                        expect.fail("Ran case code");
                    }]
            ]);
            expect.fail("Did not raise an exception");
        } catch (err) {
            expect(err).to.be.an.instanceOf(Error);
        }
    });

    it("Should allow token-reserved characters to be escaped", () => {
        let ran = false;
        match("my name is Rowan and I'm 21 years old,22;", [
            ["my name is ,1; and I'm ,2; years old,22;",
                (name, age) => {
                    ran = true;
                    expect(age).to.equal("21");
                    expect(name).to.equal("Rowan");
                }]
        ]);
        if (!ran) {
            expect.fail("Did not run case code");
        }
    });

    it("Should be able to match multiline strings by default", () => {
        let ran = false;
        match("my name is\n Rowan and I'm 21 \nyears old,22;", [
            ["my name is\n ,1; and I'm ,2; \nyears old,22;",
                (name, age) => {
                    ran = true;
                    expect(age).to.equal("21");
                    expect(name).to.equal("Rowan");
                }]
        ]);
        if (!ran) {
            expect.fail("Did not run case code");
        }
    });

    it("Should not match multiline strings if newline not in pattern", () => {
        try {
            match("my name is\n Rowan and I'm 21 \nyears old,22;", [
                ["my name is ,1; and I'm ,2; years old,22;",
                    () => {
                        expect.fail("Ran case code")
                    }]
            ]);
        } catch (err) {
            expect(err).to.be.an.instanceOf(Error);
        }
    });

    it("Should allow multiline strings at the end of grouped values", () => {
        let ran = false;
        match("my name is Rowan\n and I'm 21 years old,22;", [
            ["my name is ,1; and I'm ,2; years old,22;",
                (name) => {
                    ran = true;
                    expect(name).to.equal("Rowan\n");
                }]
        ]);
        if (!ran) {
            expect.fail("Did not run case code");
        }
    });

    it("Should allow multiline strings in the middle of grouped values", () => {
        let ran = false;
        match("my name is Rowan\nLindsay and I'm 21 years old,22;", [
            ["my name is ,1; and I'm ,2; years old,22;",
                (name) => {
                    ran = true;
                    expect(name).to.equal("Rowan\nLindsay");
                }]
        ]);
        if (!ran) {
            expect.fail("Did not run case code");
        }
    });

    it("Should allow escaped quotes to be matched", () => {
        let ran = false;
        match("my name is \"Rowan\" and I'm 21 years old,22;", [
            ["my name is \",1;\" and I'm ,2; years old,22;",
                (name) => {
                    ran = true;
                    expect(name).to.equal("Rowan");
                }]
        ]);
        if (!ran) {
            expect.fail("Did not run case code");
        }
    });

});
