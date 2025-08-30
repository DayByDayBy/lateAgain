const EventEmitter = require('events').EventEmitter

globalThis.expo = {
  EventEmitter,
  modules: {},
  SharedObject: {},
  require: jest.fn(),
  define: jest.fn(),
}

jest.mock('expo', () => ({}))
jest.mock('expo/src/winter/runtime.native', () => ({}))
jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
}))
jest.mock('expo-auth-session', () => ({
  makeRedirectUri: jest.fn(() => 'redirect-uri'),
}))
jest.mock('react-native/Libraries/Utilities/defineLazyObjectProperty', () => ({
  __ExpoImportMetaRegistry: {},
}))