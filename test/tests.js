const assert = require('assert');
const { infoCheck, readInUserData, folderCheck, validateInt, problems, writeFile, toLetters, subproblems } = require('../index');
const sinon = require('sinon');

// these will be stubbed
const fs = require('fs');
const inquirer = require('inquirer');

const user = {
    name: 'Jane Doe',
    email: 'janedoe@berkeley.edu',
    sid: '123456789'
};

const userFull = {
    name: 'Jane Doe',
    email: 'janedoe@berkeley.edu',
    sid: '123456789'
};

afterEach(function() {
    sinon.restore();
});

describe('Utility Functions', function() {
    describe('writeFile', function() {
        it('Writes a file', function() {
            let logStub = sinon.stub(console, 'log');
            let fsStub = sinon.stub(fs, 'createWriteStream').returns({
                write: () => {
                    return;
                }
            });

            writeFile('test.json', user);
            sinon.assert.calledTwice(logStub);
            sinon.assert.calledOnce(fsStub);
        });
    });

    describe('readInUserData', function() {
        it('Reads in a user in info.json', function() {
            let readStub = sinon.stub(fs.promises, 'readFile').withArgs('./info.json').returns(JSON.stringify(user));
            return readInUserData().then(returnedUser => {
                assert.deepStrictEqual(returnedUser, user);
                sinon.assert.calledOnce(readStub);
            });
        });
    });

    describe('folderCheck', function() {
        let mkStub;
        beforeEach(function() {
            mkStub = sinon.stub(fs, 'mkdir').withArgs('./selfgrades');
        });

        it('Creates the selfgrades folder if it does not exist', function() {
            let fsStub = sinon.stub(fs, 'existsSync').returns(false);
            return folderCheck().then(() => {
                sinon.assert.calledOnce(fsStub);
                sinon.assert.calledOnce(mkStub);
            });
        });

        it('Does not create the selfgrades folder if it already exists', function() {
            let fsStub = sinon.stub(fs, 'existsSync').returns(true);
            return folderCheck().then(() => {
                sinon.assert.calledOnce(fsStub);
                sinon.assert.notCalled(mkStub);
            });
        });
    });

    describe('validateInt', function() {
        it('Returns true when input is >0', function() {
            assert(validateInt(10));
        });

        it('Complains when input is not int > 0', function() {
            assert.strict.strictEqual(validateInt('string'), 'A value > 0 required.');
            assert.strict.strictEqual(validateInt(0), 'A value > 0 required.');
            assert.strict.strictEqual(validateInt(user), 'A value > 0 required.');
        });
    });

    describe('toLetters', function() {
        it('Returns "a" given 1', function() {
            assert.strict.strictEqual(toLetters(1), 'a');
        });
        it('Returns "z" given 26', function() {
            assert.strict.strictEqual(toLetters(26), 'z');
        });
        it('Returns "aa" given 27', function() {
            assert.strict.strictEqual(toLetters(27), 'aa');
        });
    });
});

describe('First Run Prompts', function() {
    it('Prompts if info.json file not found', function() {
        let fsStub = sinon.stub(fs, 'existsSync').returns(false);
        let writeStub = sinon.stub(fs, 'createWriteStream').returns({
            write: () => {
                return;
            }
        });
        let promptStub = sinon.stub(inquirer, 'prompt').resolves(user);
        let logStub = sinon.stub(console, 'log');
        return infoCheck().then(() => {
            sinon.assert.calledOnce(fsStub);
            sinon.assert.calledOnce(promptStub);
            sinon.assert.calledOnce(writeStub);
            sinon.assert.calledThrice(logStub);
        });
    });

    it('Does not prompt if info.json exists', function() {
        let fsStub = sinon.stub(fs, 'existsSync').returns(true);
        let promptStub = sinon.stub(inquirer, 'prompt').resolves(user);
        return infoCheck().then(() => {
            sinon.assert.calledOnce(fsStub);
            sinon.assert.notCalled(promptStub);
        });
    });
});

describe('Problems', function() {
    it('Calls subproblems', async function() {
        let promptStub = sinon.stub(inquirer, 'prompt').resolves({
            innerQCount: 1
        });
        let consoleStub = sinon.stub(console, 'log');
        return problems(user, userFull, 1, 1).then(() => {
            sinon.assert.calledThrice(promptStub);
            sinon.assert.calledOnce(consoleStub);
        });
    });
});

describe('Subproblems', function() {
    [0, 10].forEach(score => {
        it(`Calls prompt once if score is ${score}`, function() {
            let promptStub = sinon.stub(inquirer, 'prompt').resolves({ score });
            return subproblems(user, userFull, 1, 1, 1).then(() => {
                sinon.assert.calledOnce(promptStub);
            });
        });
    });
    [2, 5, 8].forEach(score => {
        it(`Calls prompt twice if score is ${score}`, function() {
            let promptStub = sinon.stub(inquirer, 'prompt').resolves({ score });
            return subproblems(user, userFull, 1, 1, 1).then(() => {
                sinon.assert.calledTwice(promptStub);
            });
        });
    });
});
