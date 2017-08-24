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
    'Skip the check for email duplicities. It can be memory intensive for large files.' // eslint-disable-line comma-dangle
  )
  .option(
    '-l, --limit <LIMIT>',
    'Limit amount of line numbers printed for each error. Default: 50',
    50 // eslint-disable-line comma-dangle
  )
  .parse(process.argv);

function log(msg) {
  console.log(new Date().toISOString(), msg);
}

function printReport(report, filename) {
  log(filename ? `Report for '${filename}':` : 'Intermediary report:');
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
  return validateFile(filename, report, {
    maxLinesPerError: parseInt(cmd.limit, 10),
    skipEmailDupCheck: cmd.skipEmailDupCheck,
  })
  .then(() => {
    printReport(report, filename);
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
