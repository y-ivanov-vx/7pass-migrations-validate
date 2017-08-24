const readline = require('readline');
const fs = require('fs');

const _ = require('lodash');
const moment = require('moment');
const { validate: isEmail } = require('email-validator');
const codes = require('langs').codes(1);
const countryList = require('country-list')().getCodes();

/* eslint-disable no-plusplus, no-param-reassign */

function addError(lineNumber, errorName, report, maxLinesPerError = 50) {
  if (!report[errorName]) {
    report[errorName] = [];
  }

  if (report[errorName].length < maxLinesPerError) {
    report[errorName].push(lineNumber);
  } else if (report[errorName].length === maxLinesPerError) {
    report[errorName].push('...(omitted)');
  }
}

function isNonEmptyStringOrNullOrUndefined(str) {
  return (_.isString(str) && str.length > 0) || _.isNull(str) || _.isUndefined(str);
}

function isNonEmptyStringOrNull(str) {
  return (_.isString(str) && str.length > 0) || _.isNull(str);
}

function isNonEmptyString(str) {
  return (_.isString(str) && str.length > 0);
}

function isValidDateOrNull(date) {
  return _.isNull(date) || moment(date, moment.ISO_8601).isValid();
}

function isObject(obj) {
  return _.isPlainObject(obj);
}

function validateAccount(lineNumber, account, report, options) {
  if (!_.isString(account.original_id)) {
    addError(lineNumber, 'missingOriginalId', report, options.maxLinesPerError);
  }

  if (!isEmail(account.email)) {
    addError(lineNumber, 'invalidEmail', report, options.maxLinesPerError);
  } else if (options.emailMap) {
    if (!options.emailMap[account.email]) {
      options.emailMap[account.email] = [];
    }
    options.emailMap[account.email].push(lineNumber);
  }

  if (!isValidDateOrNull(account.email_verified_at)) {
    addError(lineNumber, 'invalidEmailVerifiedAt', report, options.maxLinesPerError);
  }

  if (!isNonEmptyStringOrNull(account.nickname)) {
    addError(lineNumber, 'invalidNickname', report, options.maxLinesPerError);
  }

  if (!isNonEmptyStringOrNull(account.first_name)) {
    addError(lineNumber, 'invalidFirstName', report, options.maxLinesPerError);
  }

  if (!isNonEmptyStringOrNull(account.last_name)) {
    addError(lineNumber, 'invalidLastName', report, options.maxLinesPerError);
  }

  if (!_.isNull(account.gender) && account.gender !== 'female' && account.gender !== 'male') {
    addError(lineNumber, 'invalidGender', report, options.maxLinesPerError);
  }

  if (!_.isNull(account.preferred_language) && !codes.includes(account.preferred_language)) {
    addError(lineNumber, 'invalidPreferredLanguage', report, options.maxLinesPerError);
  }

  if (!isNonEmptyStringOrNull(account.phone_number)) {
    addError(lineNumber, 'invalidPhoneNumber', report, options.maxLinesPerError);
  }

  if (!isValidDateOrNull(account.phone_number_verified_at)) {
    addError(lineNumber, 'invalidPhoneNumberVerifiedAt', report, options.maxLinesPerError);
  }

  if (!isNonEmptyStringOrNull(account.phone_number_verified_by)) {
    addError(lineNumber, 'invalidPhoneNumberVerifiedBy', report, options.maxLinesPerError);
  }

  if (!isValidDateOrNull(account.birthdate)) {
    addError(lineNumber, 'invalidBirthdate', report, options.maxLinesPerError);
  }

  if (!isValidDateOrNull(account.birthdate_verified_at)) {
    addError(lineNumber, 'invalidBirthdateVerifiedAt', report, options.maxLinesPerError);
  }

  if (!isNonEmptyStringOrNull(account.phone_number_verified_by)) {
    addError(lineNumber, 'invalidPhoneNumberVerifiedBy', report, options.maxLinesPerError);
  }

  if (isObject(account.address)) {
    if (!isNonEmptyStringOrNull(account.address.street)) {
      addError(lineNumber, 'invalidAddressStreet', report, options.maxLinesPerError);
    }

    if (!isNonEmptyStringOrNull(account.address.city)) {
      addError(lineNumber, 'invalidAddressCity', report, options.maxLinesPerError);
    }

    if (!isNonEmptyStringOrNull(account.address.postal_code)) {
      addError(lineNumber, 'invalidAddressPostalCode', report, options.maxLinesPerError);
    }

    if (!isNonEmptyStringOrNull(account.address.state)) {
      addError(lineNumber, 'invalidAddressState', report, options.maxLinesPerError);
    }

    if (!_.isNull(account.address.country) && !countryList.includes(account.address.country)) {
      addError(lineNumber, 'invalidAddressCountry', report, options.maxLinesPerError);
    }
  }

  if (!isNonEmptyStringOrNullOrUndefined(account.password_digest_name)) {
    addError(lineNumber, 'invalidPasswordDigestName', report, options.maxLinesPerError);
  }

  // https://stackoverflow.com/questions/15733196/where-2x-prefix-are-used-in-bcrypt
  if (!isNonEmptyString(account.password_digest)) {
    addError(lineNumber, 'invalidPasswordDigest', report, options.maxLinesPerError);
  } else if (!account.password_digest_name || account.password_digest_name === 'bcrypt') {
    if (account.password_digest.match(/^\$2y\$/)) {
      addError(
        lineNumber,
        'unsupported bcrypt password digest scheme, please substitute $2y$ prefix with $2a$',
        report,
        options.maxLinesPerError // eslint-disable-line comma-dangle
      );
    } else if (!account.password_digest.match(/^\$2a\$[./ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$]{56}$/)) {
      addError(lineNumber, 'suspicious bcrypt password digest', report, options.maxLinesPerError);
    }
  }

  if (!isNonEmptyStringOrNullOrUndefined(account.password_salt)) {
    addError(lineNumber, 'invalidPasswordSalt', report, options.maxLinesPerError);
  }

  if (!isValidDateOrNull(account.created_at)) {
    addError(lineNumber, 'invalidCreatedAt', report, options.maxLinesPerError);
  }
}

function validateLine(lineNumber, line, report, options) {
  report.processed++;

  try {
    const account = JSON.parse(line);
    validateAccount(lineNumber, account, report, options);
  } catch (err) {
    addError(lineNumber, 'failedToParse', report, options.maxLinesPerError);
  }
}

function validateEmailDuplicities(report, options) {
  _.forEach(options.emailMap, (lines) => {
    if (lines.length > 1) {
      let dups;
      if (lines.length > options.maxLinesPerError) {
        dups = JSON.stringify(lines.slice(0, options.maxLinesPerError));
        dups = dups.replace(']', ', ...]');
      } else {
        dups = JSON.stringify(lines);
      }
      addError(dups, 'duplicateEmail', report, options.maxLinesPerError);
    }
  });
}

function validateFile(path, report, options = { maxLinesPerError: 50, skipEmailDupCheck: false }) {
  return new Promise((resolve, reject) => {
    let lineNumber = 1;

    if (!options.skipEmailDupCheck) {
      options.emailMap = {};
    }

    const rl = readline.createInterface({
      input: fs.createReadStream(path),
    });

    rl.on('line', (line) => {
      validateLine(lineNumber++, line, report, options);
    });

    rl.on('close', () => {
      if (!options.skipEmailDupCheck) {
        validateEmailDuplicities(report, options);
      }
      resolve(report);
    });
    rl.on('error', () => reject(report));
  });
}

module.exports = validateFile;
