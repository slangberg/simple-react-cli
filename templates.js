'use strict';
const fs = require('fs');
const path = require('path');
const colors = require('colors');
const findConfig = require('find-config');
const inquirer   = require('inquirer');

module.exports = class ThemeBuilder {
    constructor(firstName, lastName) {
        this.questions = [{
            name: 'theme-name',
            type: 'input',
            message: 'Theme Name:',
            validate: (input) => {
                if (/[A-Za-z]/.test(input)) return true;
                else return 'Theme name may only include letters.';
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
            console.log('Error: Name Must Only Contain Letters underscores or -'.bold.red);
        }
    }

    ask() {
        inquirer.prompt(this.questions)
            .then(answers => {
                var themeName = answers['theme-name'];
                this.setUpGen(themeName);
            });
    }

    setUpGen(themeName){
        const CURR_DIR = process.cwd();
        const templatePath = `${__dirname}/templates/theme-template`;
        themeName = themeName.toLowerCase();
        const projectRoot = findConfig('package.json', { dir: CURR_DIR }).replace('package.json','');
        console.log(`*==== Generating ${themeName} Files ====*`);
        try {
            fs.mkdirSync(`${projectRoot}/themes/${themeName}`);
            this.createDirectoryContents(templatePath, themeName, projectRoot);
        }
        catch (e) {
            if (e.code == 'EEXIST') {
                console.log(`Theme Named ${themeName} Already Exists`.red.bold);
            }
        }
    }

    createDirectoryContents(templatePath, themeName, projectRoot) {
         //read template source files
         const filesToCreate = fs.readdirSync(templatePath);
         filesToCreate.forEach(file => {
            const origFilePath = `${templatePath}/${file}`;
            const filename = file.replace("TEMP", themeName);
            const stats = fs.statSync(origFilePath);
            const writePath = `${projectRoot}themes/${themeName}/${filename}`;
            
            // test to see if file or directory
            if (stats.isFile()) {
                 // Add component name to file names
                
                // Read tmeplate file
                const contents = fs.readFileSync(origFilePath, 'utf8');

                // Create new file with the componet name filled in
               
                fs.writeFile(writePath, this.replaceContent(contents, themeName), function (err) {
                    if (err) {
                        return console.error(`Error Writing: ${filename}`);
                    }
                    else {
                        console.log(`${'Added:'.bold.green} ${filename}`);
                    }
                });
            }
        });

        try {
            fs.mkdirSync(`${projectRoot}themes/${themeName}/images`);
            console.log(`${'Added:'.bold.green} /images`);
            fs.mkdirSync(`${projectRoot}themes/${themeName}/icons`);
            console.log(`${'Added:'.bold.green} /icons`);
            
        }
        catch (e) {
            console.log(`Subdirectory Create Fail`.red.bold, e);        
        }
    }


    replaceContent(content, componentName){
        let temp = content.replace(':REPLACE:', componentName);
        return temp;
    }
}