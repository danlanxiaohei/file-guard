'use strict'
const Emitter = require('events').EventEmitter
const schedule = require('node-schedule')
const Monocle = require('monocle')

function FileGuard (config) {
  if (!(this instanceof FileGuard)) return new FileGuard(config)
  this.config = config
  this.monocle = Monocle()
  this.cache = {}
  if (config.schedule_rule) {
    start_schedule.call(this)
  }
}

Object.setPrototypeOf(FileGuard.prototype, Emitter.prototype)

FileGuard.prototype.startWatching = function () {
  const self = this
  const fileFilter = get_file_filter.call(self)
  self.monocle.watchDirectory({
    root: self.config.root,
    fileFilter: fileFilter,
    listener: function (stat) {
      calculate.call(self, stat)
    },
    complete: function () {
      console.log('Log guard has already started watching')
    }
  })
}

function start_schedule () {
  const self = this
  self.schedule_job = schedule.scheduleJob(self.config.schedule_rule, function () {
    self.monocle.unwatchAll()
    self.cache = {}
    self.startWatching()
  })
}

function get_file_filter () {
  return (typeof this.config.file_filter === 'function') ? this.config.file_filter() : this.config.file_filter
}

function calculate (stat) {
  const self = this
  const m_array = self.cache[stat.fullPath]
  if (!m_array) {
    self.cache[stat.fullPath] = []
  }

  self.cache[stat.fullPath].push(Date.now())
  // remove the element which is not in the latest interval
  const change_count = self.config.rate_limit.change_count // 获取配置中的个数
  if (self.cache[stat.fullPath].length < change_count) {
    return
  }

  // refresh cache[stat.fullPath]
  const in_milliseconds = self.config.rate_limit.in_milliseconds
  self.cache[stat.fullPath] = self.cache[stat.fullPath].filter(function (element) {
    return element + in_milliseconds > Date.now()
  })

  if (self.cache[stat.fullPath].length >= change_count) {
    // emit 'alert' event
    self.emit('alert', {
      'file': stat.fullPath,
      'rate': `${change_count}/${in_milliseconds}ms`
    })
    delete self.cache[stat.fullPath] // clean
  }
}

module.exports = FileGuard
