#! /usr/bin/env node

const fs = require('fs');
const path = require('path');
var findConfig = require('find-config');
var componetGen = require('./components');

const componentsFactory = new componetGen();
componentsFactory.generate();