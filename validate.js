const readline = require('readline');
const fs = require('fs');

const _ = require('lodash');
const moment = require('moment');
const { validate: isEmail } = require('email-validator');
const codes = require('langs').codes(1);
const countryList = require('country-list')().getCodes();

/* eslint-disable no-plusplus, no-param-reassign */

function addError(lineNumber, errorName, report) {
  if (!report[errorName]) {
    report[errorName] = [];
  }

  if (report[errorName].length < 50) {
    report[errorName].push(lineNumber);
  } else if (report[errorName].length === 50) {
    report[errorName].push('< omitted>');
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

function validateAccount(lineNumber, account, report, emailMap) {
  if (!_.isString(account.original_id)) {
    addError(lineNumber, 'missingOriginalId', report);
  }

  if (!isEmail(account.email)) {
    addError(lineNumber, 'invalidEmail', report);
  } else if (emailMap) {
    if (!emailMap[account.email]) {
      emailMap[account.email] = [];
    }
    emailMap[account.email].push(lineNumber);
  }

  if (!isValidDateOrNull(account.email_verified_at)) {
    addError(lineNumber, 'invalidEmailVerifiedAt', report);
  }

  if (!isNonEmptyStringOrNull(account.nickname)) {
    addError(lineNumber, 'invalidNickname', report);
  }

  if (!isNonEmptyStringOrNull(account.first_name)) {
    addError(lineNumber, 'invalidFirstName', report);
  }

  if (!isNonEmptyStringOrNull(account.last_name)) {
    addError(lineNumber, 'invalidLastName', report);
  }

  if (!_.isNull(account.gender) && account.gender !== 'female' && account.gender !== 'male') {
    addError(lineNumber, 'invalidGender', report);
  }

  if (!_.isNull(account.preferred_language) && !codes.includes(account.preferred_language)) {
    addError(lineNumber, 'invalidPreferredLanguage', report);
  }

  if (!isNonEmptyStringOrNull(account.phone_number)) {
    addError(lineNumber, 'invalidPhoneNumber', report);
  }

  if (!isValidDateOrNull(account.phone_number_verified_at)) {
    addError(lineNumber, 'invalidPhoneNumberVerifiedAt', report);
  }

  if (!isNonEmptyStringOrNull(account.phone_number_verified_by)) {
    addError(lineNumber, 'invalidPhoneNumberVerifiedBy', report);
  }

  if (!isValidDateOrNull(account.birthdate)) {
    addError(lineNumber, 'invalidBirthdate', report);
  }

  if (!isValidDateOrNull(account.birthdate_verified_at)) {
    addError(lineNumber, 'invalidBirthdateVerifiedAt', report);
  }

  if (!isNonEmptyStringOrNull(account.phone_number_verified_by)) {
    addError(lineNumber, 'invalidPhoneNumberVerifiedBy', report);
  }

  if (isObject(account.address)) {
    if (!isNonEmptyStringOrNull(account.address.street)) {
      addError(lineNumber, 'invalidAddressStreet', report);
    }

    if (!isNonEmptyStringOrNull(account.address.city)) {
      addError(lineNumber, 'invalidAddressCity', report);
    }

    if (!isNonEmptyStringOrNull(account.address.postal_code)) {
      addError(lineNumber, 'invalidAddressPostalCode', report);
    }

    if (!isNonEmptyStringOrNull(account.address.state)) {
      addError(lineNumber, 'invalidAddressState', report);
    }

    if (!_.isNull(account.address.country) && !countryList.includes(account.address.country)) {
      addError(lineNumber, 'invalidAddressCountry', report);
    }
  }

  if (!isNonEmptyStringOrNullOrUndefined(account.password_digest_name)) {
    addError(lineNumber, 'invalidPasswordDigestName', report);
  }

  // https://stackoverflow.com/questions/15733196/where-2x-prefix-are-used-in-bcrypt
  if (!isNonEmptyString(account.password_digest)) {
    addError(lineNumber, 'invalidPasswordDigest', report);
  } else if (!account.password_digest_name || account.password_digest_name === 'bcrypt') {
    if (account.password_digest.match(/^\$2y\$/)) {
      addError(lineNumber, 'unsupported bcrypt password digest scheme, please substitute $2y$ prefix with $2a$', report);
    } else if (!account.password_digest.match(/^\$2a\$[./ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$]{56}$/)) {
      addError(lineNumber, 'suspicious bcrypt password digest', report);
    }
  }

  if (!isNonEmptyStringOrNullOrUndefined(account.password_salt)) {
    addError(lineNumber, 'invalidPasswordSalt', report);
  }

  if (!isValidDateOrNull(account.created_at)) {
    addError(lineNumber, 'invalidCreatedAt', report);
  }
}

function validateLine(lineNumber, line, report, emailMap) {
  report.processed++;

  try {
    const account = JSON.parse(line);
    validateAccount(lineNumber, account, report, emailMap);
  } catch (err) {
    addError(lineNumber, 'failedToParse', report);
  }
}

function validateEmailDuplicities(emailMap, report) {
  _.forEach(emailMap, (lines) => {
    if (lines.length > 1) {
      addError(JSON.stringify(lines), 'duplicateEmail', report);
    }
  });
}

function validateFile(path, report, skipEmailDupCheck) {
  return new Promise((resolve, reject) => {
    let lineNumber = 1;

    const emailMap = {}; // used only unless email duplicity check is disabled

    const rl = readline.createInterface({
      input: fs.createReadStream(path),
    });

    rl.on('line', (line) => {
      validateLine(lineNumber++, line, report, skipEmailDupCheck ? null : emailMap);
    });

    rl.on('close', () => {
      if (!skipEmailDupCheck) {
        validateEmailDuplicities(emailMap, report);
      }
      resolve(report);
    });
    rl.on('error', () => reject(report));
  });
}

module.exports = validateFile;
