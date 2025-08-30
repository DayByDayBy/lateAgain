const EventEmitter = require('events').EventEmitter

globalThis.expo = {
  EventEmitter,
  modules: {},
  SharedObject: {},
  require: jest.fn(),
  define: jest.fn(),
}