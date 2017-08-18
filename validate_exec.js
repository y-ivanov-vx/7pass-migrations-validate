#!/usr/bin/env node

const { validateFile } = require('./validate');

/* eslint-disable no-console, no-restricted-syntax */

function log(msg) {
  console.log(new Date().toISOString(), msg);
}

function printReport(report) {
  log('Report:');
  for (const key of Object.keys(report)) {
    const value = report[key];
    console.log(`${' '.repeat(25)} ${key}: ${value.join ? value.join(', ') : value}`);
  }
}

if (process.argv.length === 3) {
  const filename = process.argv[2];
  const report = {
    processed: 0,
  };
  const reporterId = setInterval(() => printReport(report), 5000);

  log('Running...');
  validateFile(filename, report)
    .then(() => {
      printReport(report);
      log('Finished');
    })
    .catch((err) => {
      log(`Something went wrong: ${err}`);
    })
    .then(() => clearInterval(reporterId));
} else {
  log('Usage: migrations-validator file.json');
  process.exitCode = 1;
}
