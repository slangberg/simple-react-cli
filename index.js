#! /usr/bin/env node

const fs = require('fs');
const path = require('path');
const colors = require('colors');
const componentGen = require('./components');
const templateGen = require('./templates');
var argv = require('minimist')(process.argv.slice(2));
const componentsFactory = new componentGen();
const templateFactory = new templateGen()
const inquirer = require('inquirer');

const genQuestions = [{
    name: 'gen-type',
    type: 'list',
    message: 'What would you like to genrate?',
    choices: ['Component', 'Theme']
}];



if (argv.g) {
    if (argv.c) {
        componentsFactory.validateName(argv.c);
    }
    else if (argv.t) {
        templateFactory.validateName(argv.t);
    }
    else {
        ask();
    }
} else {
    ask();
};

function ask(){
    inquirer.prompt(genQuestions)
    .then(answer => {
        var choice = answer['gen-type'];
        if (choice === 'Component') {
            componentsFactory.generate();
        }
         else if (choice === 'Theme') {
            templateFactory.generate();
        }
    });
}