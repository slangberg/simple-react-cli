#! /usr/bin/env node

const fs = require('fs');
const path = require('path');
const colors = require('colors');
var componetGen = require('./components');
var argv = require('minimist')(process.argv.slice(2));
const componentsFactory = new componetGen();
const inquirer = require('inquirer');

const genQuestions = [{
    name: 'gen-type',
    type: 'list',
    message: 'What would you like to genrate?',
    choices: ['Component', 'Template']
}];



if (argv.g) {
    if (argv.c) {
        componentsFactory.validatetName(argv.c)
    }
    else if (argv.t) {

    }
    else {
        inquirer.prompt(genQuestions)
            .then(answer => {
                var componentName = answer['gen-type'];
                if ('Component') {
                    componentsFactory.generate();
                }
            });
    }
};

