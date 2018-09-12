function Queue() {
  this.data = []
}

Queue.prototype.add = function (record) {
  this.data.unshift(record)
}
Queue.prototype.remove = function() {
  this.data.pop()
}

Queue.prototype.first = function() { // first in queue
  return this.data[this.data.length - 1]
}

Queue.prototype.last = function() { // last in queue
  return this.data[0]
}

Queue.prototype.size = function() {
  return this.data.length
}

module.exports = Queue
