const { infoCheck, readInUserData, folderCheck, validateInt, problems, writeFile} = require('./index');
const inquirer = require('inquirer');

let assignment = 'selfgrades-';

let user, userFull;

let kickoff = async () => {
    await infoCheck();
    user = await readInUserData();
    userFull = await readInUserData();
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
        return problems(user, userFull, answers.outerQCount, 1);
    }).then(() => {
        writeFile(`./selfgrades/${assignment}.txt`, user);
        writeFile(`./selfgrades/${assignment}-redo.txt`, userFull);
    });
};

kickoff();
