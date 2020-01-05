#!/usr/bin/env node

const downloader = require('../imgig');
const program = require('commander');


program
    .command('telecharger <user> <pass> [numbers_and_Tags...]')
    .description('download n pics')
    .action((user, pass, numbers_and_Tags) => {
        console.log('downloading...: ' + numbers_and_Tags )
         downloader.telecharger(user, pass, numbers_and_Tags)
    })


program.parse(process.argv);

