const fs = require('fs');
const inquirer = require('inquirer');

let assignment = 'selfgrades-';
const info = './info.json';

let user = {
    name: null,
    email: null,
    sid: null
};

let userFull = {
    name: null,
    email: null,
    sid: null
};

const writeFile = (path, data) => {
    console.log(`Writing ${path}`);
    fs.createWriteStream(`${path}`).write(JSON.stringify(data));
    console.log(`Finished writing to ${path}`);
};

const infoCheck = async () => {
    if (!fs.existsSync(info)) {
        /**
         * info.txt doesn't exist, let's generate it
         */
        console.log('First time, generating info.txt');
        return inquirer.prompt([{
            name: 'name',
            message: 'Name?',
            validate: validateText
        }, {
            name: 'email',
            message: 'Email?',
            validate: validateText
        }, {
            name: 'sid',
            message: 'SID?',
            validate: validateText
        }]).then(answers => {
            writeFile(info, answers);
        });
    }
};

const folderCheck = async () => {
    /**
     * checks if folder doesn't exist, and makes it if it doesn't
     * existsSync isn't deprecated (for now), but exists is. Go figure.
     */
    if (!fs.existsSync('./selfgrades')) {
        return fs.mkdir('./selfgrades', err => {
            if (err) {
                throw err;
            }
        });
    }
};

const readInUserData = async () => {
    return fs.readFile(info, (err, data) => {
        user = JSON.parse(data);
        userFull = JSON.parse(data);
    });
};

const validateInt = async (input) => {
    return input > 0 ? true : 'A value > 0 required.';
};

const validateText = async (input) => {
    return input.length > 0 ? true : 'A comment is required if score is not 0 or 10.';
};

const problems = (maxOuter, currOuter) => {
    console.log(`Question ${currOuter}`);
    return inquirer.prompt([{
        type: 'number',
        name: 'innerQCount',
        message: 'How many subproblems?',
        validate: validateInt
    }]).then(answers => {
        return subproblems(answers.innerQCount, currOuter, 1);
    }).then(() => {
        if (currOuter < maxOuter) {
            return problems(maxOuter, currOuter + 1);
        }
    });
};

let toLetters = (num) => {
    /**
     * converts num to column name (in case a problem goes past Z; seeing as we got a problem that went up to part Y this is a possibilty)
     * makes the assumption it goes into column based names, but who knows really
     * stolen from cwestblog.com/2013/09/05/javascript-snippet-convert-number-to-column-name
     */
    let ret = '';
    for (let a = 1, b = 26; (num -= a) >= 0; a = b, b *= 26) {
        ret = String.fromCharCode(parseInt((num % b) / a) + 65).toLowerCase() + ret;
    }
    return ret;
};

const subproblems = (maxInner, outerQ, currInner) => {
    let letter = toLetters(currInner);

    return inquirer.prompt([{
        type: 'list',
        name: 'score',
        message: `q${outerQ}${letter}`,
        choices: [0, 2, 5, 8, 10]
    }]).then(answers => {
        user[`q${outerQ}${letter}`] = `${answers.score}`;
        userFull[`q${outerQ}${letter}`] = '10';
        if (answers.score !== 0 && answers.score !== 10) {
            return inquirer.prompt([{
                name: 'comment',
                message: `q${outerQ}${letter}-comment`,
                validate: validateText
            }]).then(answers => {
                user[`q${outerQ}${letter}-comment`] = answers.comment;
            });
        }
    }).then(() => {
        if (currInner < maxInner) {
            return subproblems(maxInner, outerQ, currInner + 1);
        }
    });
};

let kickoff = async () => {
    await infoCheck();
    await readInUserData();
    await folderCheck();

    return inquirer.prompt([{
        type: 'number',
        name: 'hwNumber',
        message: 'HW #?',
        validate: validateInt
    },{
        type: 'number',
        name: 'outerQCount',
        message: 'How many numbered questions?',
        validate: validateInt
    }]).then(answers => {
        assignment += answers.hwNumber;
        return problems(answers.outerQCount, 1);
    }).then(() => {
        writeFile(`./selfgrades/${assignment}.txt`, user);
        writeFile(`./selfgrades/${assignment}-redo.txt`, userFull);
    });
};

kickoff();
