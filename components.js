'use strict';

const fs = require('fs');
const path = require('path');
const colors = require('colors');
var findConfig = require('find-config');
const inquirer   = require('inquirer');

module.exports = class ComponentBuilder {
    constructor(firstName, lastName) {
        this.questions = [{
            name: 'component-name',
            type: 'input',
            message: 'Component Name:',
            validate: (input) => {
                if (/[A-Za-z]/.test(input)) return true;
                else return 'Component name may only include letters, numbers, underscores and hashes.';
            }
        }];
    }

    generate(name) {
        if(!name){
            this.ask();
        }
        else {
            this.setUpGen(name);
        }
    }

    validateName(name){
        if (/[A-Za-z]/.test(name)) {
            this.setUpGen(name)
        }
        else {
            console.log('Error: Name Must Only Contain Letters'.bold.red);
        }
    }

    ask() {
        inquirer.prompt(this.questions)
            .then(answers => {
                var componentName = answers['component-name'];
                this.setUpGen(componentName);
            });
    }

    setUpGen(componentName){
        const CURR_DIR = process.cwd();
        const templatePath = `${__dirname}/templates/component-template`;
        componentName = componentName.charAt(0).toUpperCase() + componentName.slice(1);
        try {
            fs.mkdirSync(`${CURR_DIR}/${componentName}`);
            this.createDirectoryContents(templatePath, componentName, CURR_DIR);
        }
        catch (e) {
            if (e.code == 'EEXIST') {
                console.log(`Component Named ${componentName} Already Exists`.red.bold);
            }
        }
    }

    createDirectoryContents(templatePath, componentName, currentDirectory) {
        //read template source files
        const filesToCreate = fs.readdirSync(templatePath);
        console.log(`*==== Generating ./${componentName} Files ====*`);

        filesToCreate.forEach(file => {
            const origFilePath = `${templatePath}/${file}`;
            const stats = fs.statSync(origFilePath);
            
            // test to see if file or directory
            if (stats.isFile()) {
                 // Add component name to file names
                const filename = file.replace("TEMP", componentName);

                // Read template file
                const contents = fs.readFileSync(origFilePath, 'utf8');

                // Create new file with the component name filled in
                const writePath = `${currentDirectory}/${componentName}/${filename}`;
                fs.writeFile(writePath, this.replaceContent(contents, componentName), function (err) {
                    if (err) {
                        return console.error(`Error Writing: ${filename}`);
                    }
                    else {
                        console.log(`${'Added:'.bold.green} ${filename}`);
                    }
                });
            }
        });
        this.addToMain(currentDirectory, componentName);
    }

    addToMain(currentDirectory, componentName) {
        // Fin nearest main.ts file
        const target = findConfig('main.ts', { dir: currentDirectory });
        const relativePath = path.relative(target, currentDirectory);
        try {
            var contents = fs.readFileSync(target, 'utf8');
            // split contents into an array by line
            var byline = contents.split('\n');
            // find index of last import at the top of the file
            var lastImportIndex = byline.length - byline.slice().reverse().findIndex((line) => line.startsWith('import'));

            // Generate import path to new component file from main.ts
            var fileImportPath = `${relativePath.slice( 1 )}/${componentName}/${componentName}`;

            // Add the import line
            byline.splice(lastImportIndex, 0, `import ${componentName} from '${fileImportPath}';`);

            // Add the class to  export
            var exportCloseIndex = (byline.length - byline.slice().reverse().findIndex((line) => line.includes('};'))) - 1;
            byline[exportCloseIndex - 1] = byline[exportCloseIndex - 1] + ',';
            byline.splice(exportCloseIndex, 0, componentName);
        
            // turn back into string and overwrite main
            fs.writeFile(target, byline.join('\n'), function (err) {
                if (err) {
                    return console.error(`Error: failed to add ${componentName} to main.ts`);
                }
                else {
                    console.log(`${'Added:'.bold.green} ${componentName} to main.ts`);
                }
            });
          
        }
        catch(e) {
            console.log('Main.ts Read error'.bold.red, e);
        }
    }
    
    replaceContent(content, componentName){
        let temp = content.replace(':REPLACE:', componentName);
        return temp;
    }

}