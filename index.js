#!/usr/bin/env node

const cmd = require('commander');
const validateFile = require('./validate');

/* eslint-disable no-console, no-restricted-syntax */

cmd
  .description('Validate export file for the 7Pass migration pool.')
  .version(require('./package.json').version)
  .usage('[options] <export.jsonl> [export2.jsonl...]')
  .option(
    '-s, --skip-email-dup-check',
    'Skip the check for email duplicities. It can be memory intensive for large files.'
  )
  .parse(process.argv);

function log(msg) {
  console.log(new Date().toISOString(), msg);
}

function printReport(filename, report) {
  log(`Report for '${filename}':`);
  for (const key of Object.keys(report)) {
    const value = report[key];
    console.log(`    ${key}: ${value.join ? value.join(', ') : value}`);
  }
}

function processFile(filename) {
  const report = {
    processed: 0,
  };
  const reporterId = setInterval(() => printReport(report), 5000);

  log(`Processing '${filename}'...`);
  return validateFile(filename, report, cmd.skipEmailDupCheck)
    .then(() => {
      printReport(filename, report);
    })
    .catch((err) => {
      log(`Something went wrong: ${err}`);
    })
    .then(() => clearInterval(reporterId));
}

if (!cmd.args.length) {
  process.exitCode = 1;
  cmd.help();
} else {
  let p = Promise.resolve();
  cmd.args.forEach((filename) => {
    p = p.then(() => processFile(filename));
  });
  p.then(() => log('Finished'));
}
