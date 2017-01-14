# file-guard
A file guard, notify you when logs increase exceeds limits

## Installation
npm install file-guard


## Usage
### example
```
'use strict'

const FileGuard = require('file-guard')
const moment = require('moment')

const file_filter = function () {
  const hour = moment().format('YYYY-MM-DD-HH')
  return `*.${hour}.log`
}
// const file_filter = '*.log'

const guard = FileGuard({
  'root': 'path/to/logs',
  'file_filter': file_filter,
  'rate_limit': {'change_count': 4, 'in_milliseconds': 1 * 60 * 1000}, // 4 changes in 1 minute
  'schedule_rule': '0 0 0 * * *'
})

guard.on('alert', function (obj) {
  console.log('on alert ', obj)
})

guard.startWatching()
```
### parameter
**root**: path in which to start watching.

**fileFilter**: a string (e.g., `*.js`) which is matched using [minimatch](https://github.com/isaacs/minimatch), or a function which return a matched minimatch string.

**rate_limit**: the max change rate limit.

**schedule_rule**: the rule to refresh the file_filter, see [node-schedule](https://www.npmjs.com/package/node-schedule) for more.
