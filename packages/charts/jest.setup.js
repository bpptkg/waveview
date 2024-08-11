const { TextEncoder, TextDecoder } = require('util');
const { Blob } = require('blob-polyfill');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.Blob = Blob;
