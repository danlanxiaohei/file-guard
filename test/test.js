'use strict'
const FileGuard = require('../index')

const guard = FileGuard({
  'root': './logs',
  'file_filter': '*.log',
  'rate_limit': {'change_count': 4, 'in_milliseconds': 1 * 60 * 1000}, // 4 changes in 1 minute
  'schedule_rule': '0 0 0 * * *'
})

guard.on('alert', function (obj) {
  console.log('on alert ', obj)
})

guard.startWatching()
