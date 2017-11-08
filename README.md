# Migrations: Specification

The following text specifies the format and the structure of the data that is
to be deliver by the integrating party. The party can use the provided
validation script to ensure that the data is valid before submitting it.

## File format

The data is delivered as a single UTF-8 encoded [jsonl file](http://jsonlines.org/).
Each line contains a single JSON representation of an account.
The line is ended with UNIX style line separator (`\n`).

```jsonl
{"original_id": "12312312", "email": "rick@example.com"}\n
{"original_id": "12312313", "email": "rick2@example.com"}\n
```

### Lines

Each line contains a JSON document of an account. The fields described below are
required and will cause an error if missing. Additionally the validation script
will produce an error for unknown fields.

```json
{
  "original_id": "12312312",
  "email": "rick@example.com",
  "email_verified_at": "2017-06-21T12:11:54.463Z",
  "nickname": "Morty",
  "first_name": "Beth",
  "last_name": "Smith",
  "gender": "female",
  "preferred_language": "en",
  "phone_number": "800123456",
  "phone_number_verified_at": "2017-06-22T12:11:54.463Z",
  "phone_number_verified_by": "operator",
  "birthdate": "2017-06-01T12:01:23.456Z",
  "birthdate_verified_at": "2017-06-01T12:01:23.456Z",
  "birthdate_verified_by": "operator",
  "address": {
    "street": "Platz der Republik 1",
    "city": "Berlin",
    "postal_code": "11011",
    "state": "Brandenburg",
    "country": "de"
  },
  "password_digest_name": "bcrypt",
  "password_digest": "$2a$10$ekiHPhlSKTAI4svvLrBgwefJ6/XlcOmUlPel1ovsGnfN2R6rC9QgS",
  "password_salt": "E1F53135E559C253",
  "created_at": "2017-06-01T12:01:23.456Z"
}
```

<table>
  <thead>
    <tr>
      <th>Field</th>
      <th>Type</th>
      <th>Examples</th>
      <th>Description</th>
    <tr>
  </thead>
  <tbody>
   <tr>
     <td>original_id</td>
     <td>String</td>
     <td>12312312</td>
     <td>
       A unique identifier of the account. The format is not enforced beyond
       being a string and being unique across the whole account database (file).
       These values will be used as historic references only, each imported
       account will have a new ID assigned.
     </td>
   </tr>

   <tr>
     <td>email</td>
     <td>String</td>
     <td>rick@example.com</td>
     <td>
       A primary email of the account. Note that the value needs to be
       in <strong>lower case</strong> and <strong>unique</strong> as well.
     </td>
   </tr>

   <tr>
     <td>email_verified_at</td>
     <td>String | null</td>
     <td>2017-06-21T12:11:54.463Z</td>
     <td>
       An ISO 8601 formatted date representing the time the email was verified. (in general that's the date when the user clicked the activation-/ confirmation-link in a DOI mail. If you've got only a bool value available for that property use the registration date of the user)
     </td>
   </tr>

   <tr>
     <td>nickname</td>
     <td>String | null</td>
     <td>Morty</td>
     <td>
       A nickname associated with the account. Doesn't have to be unique.
     </td>
   </tr>

   <tr>
     <td>username</td>
     <td>String | null</td>
     <td>Morty</td>
     <td>
       A username associated with the account. Assigned only when not conflicting with existing username in our database.
     </td>
   </tr>

   <tr>
     <td>first_name</td>
     <td>String | null</td>
     <td>Beth</td>
     <td></td>
   </tr>

   <tr>
     <td>last_name</td>
     <td>String | null</td>
     <td>Smith</td>
     <td></td>
   </tr>

   <tr>
     <td>gender</td>
     <td>String | null</td>
     <td>male</td>
     <td>
       The only values are "male" or "female"
     </td>
   </tr>

   <tr>
     <td>preferred_language</td>
     <td>String | null</td>
     <td>de, en, fr, ...</td>
     <td>An ISO 639-1 encoded language code.</td>
   </tr>

   <tr>
     <td>phone_number</td>
     <td>String | null</td>
     <td>800123456</td>
     <td></td>
   </tr>

   <tr>
     <td>phone_number_verified_at</td>
     <td>String | null</td>
     <td>2017-06-22T12:11:54.463Z</td>
     <td>
       An ISO 8601 formatted date representing the time the phone number was verified.
     </td>
   </tr>

   <tr>
     <td>phone_number_verified_by</td>
     <td>String | null</td>
     <td>operator</td>
     <td>
       An information about the way the phone number verified.
     </td>
   </tr>

   <tr>
     <td>birthdate</td>
     <td>String | null</td>
     <td>1991-11-02T12:11:54.463Z</td>
     <td></td>
   </tr>

   <tr>
     <td>birthdate_verified_at</td>
     <td>String | null</td>
     <td>1991-11-02T12:11:54.463Z</td>
     <td></td>
   </tr>

   <tr>
     <td>birthdate_verified_by</td>
     <td>String | null</td>
     <td>operator</td>
     <td></td>
   </tr>

   <tr>
     <td>address</td>
     <td>Object | null</td>
     <td></td>
     <td>An object representing the address of the account holder. See below for the individual fields.</td>
   </tr>

   <tr>
     <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;street</td>
     <td>String | null</td>
     <td></td>
     <td></td>
   </tr>

   <tr>
     <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;city</td>
     <td>String | null</td>
     <td></td>
     <td></td>
   </tr>

   <tr>
     <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;postal_code</td>
     <td>String | null</td>
     <td></td>
     <td></td>
   </tr>

   <tr>
     <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;state</td>
     <td>String | null</td>
     <td></td>
     <td></td>
   </tr>

   <tr>
     <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;country</td>
     <td>String | null</td>
     <td>DE, CH, CZ...</td>
     <td>An ISO 3166-1-alpha-2 encoded country code.</td>
   </tr>

   <tr>
     <td>password_digest</td>
     <td>String</td>
     <td>$2a$10$/zUAC.EzP85...</td>
     <td>A bcrypt digest of the account's password. If other format is used, it needs to be communicated.</td>
   </tr>

   <tr>
     <td>password_digest_name</td>
     <td>String | null</td>
     <td>bcrypt</td>
     <td>The name of the digest used for the non-bcrypt legacy password hashing.</td>
   </tr>

   <tr>
     <td>password_salt</td>
     <td>String | null</td>
     <td>E1F53135E55...</td>
     <td>Optional password salt used in non-bcrypt legacy password digest.</td>
   </tr>

   <tr>
     <td>created_at</td>
     <td>String | null</td>
     <td>2017-06-22T12:11:54.463Z</td>
     <td>
       An ISO 8601 formatted date representing the time the user account was initially created.
     </td>
   </tr>

  </tbody>
</table>

## BCrypt password digests

**PHP bcrypt digests:** PHP had faulty `$2a$` implementation and to differentiate
fixed hashes from the wrong ones the prefix is `$2y$`. It is necessary to just replace
it with `$2a$`.

Good explanation of different BCrypt prefixes can be found on
[StackOverflow](https://stackoverflow.com/questions/15733196/where-2x-prefix-are-used-in-bcrypt).

We currently support only `$2a$` digests.

## Validation script

A validation script is available to verify the structure of the export file.

### Installation

 * clone the repository and enter its directory
 * make sure the recent enough Node.js is installed
   ```bash
   $ nvm install
   ```
 * install it globally for the given version of Node.js
   ```bash
   $ npm install -g
   ```
 * the validation script is now available as `migrations-validate` executable

**Internally** the validation script can be installed as simple as:
```bash
npm install -g @pass/migrations-validate
```

### Execution

```bash
$ migrations-validate --help
...
$ migrations-validate examples/*.jsonl
2017-11-08T13:22:59.614Z Processing 'examples/invalid.jsonl'...
2017-11-08T13:22:59.628Z Report for 'examples/invalid.jsonl':
    processed: 4
    unsupported bcrypt password digest scheme, please substitute $2y$ prefix with $2a$: 1
    emailNotLowerCase: 2
    suspicious bcrypt password digest: 2, 3
    invalidPasswordDigest: 4
    duplicateEmail: [1,3], [2,4]
2017-11-08T13:22:59.629Z Processing 'examples/valid.jsonl'...
2017-11-08T13:22:59.631Z Report for 'examples/valid.jsonl':
    processed: 2
2017-11-08T13:22:59.631Z Finished
```

The script will read the file line by line, it will not read the whole file to
memory at once. The script will print the current status (report) every 5
seconds and at the very end. The `processed` field contains the number of rows
that have been processed so far. Other field names indicate the type of error
encountered and the value is an array of corresponding line numbers. Note that
the array of line numbers is capped to the first 50 elements for each error.
Also note that the email duplicity check gathers all emails in a hash as
the file is being processed so that it can determine email duplicities when the
whole file is parsed. This can be memory intensive for very large files and
it can be disabled via parameter.

