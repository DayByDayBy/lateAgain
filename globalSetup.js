module.exports = async function() {
  const EventEmitter = require('events').EventEmitter

  globalThis.expo = {
    EventEmitter,
    modules: {},
    SharedObject: {},
    require: () => {},
    define: () => {},
    uuidv4: () => 'mock-uuid',
    v4: () => 'mock-uuid',
    uuid: {
      v4: () => 'mock-uuid',
    },
  }

  global.uuid = {
    v4: () => 'mock-uuid',
  }
}