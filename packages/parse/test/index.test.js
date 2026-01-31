const test = require('node:test');
const assert = require('node:assert');
const { Parse } = require('..');

test.describe('test ipv4', () => {
  test('ipv4-1', () => {
    const data1 = Buffer.from('4845e6ce9faf30ae7be7116308004500008b155740006906683c0d59b30dc0a812cb01bbd88361540518e410fadb5018400073750000170303005eef26eefc234906c8621d56d4b5a6ad5165e7930f9d9baf01d205157ad679c188470caae609283863a15e017c2c621372ce29567db43a308e1073cad0cf4776a02307ffc2a3a0a376c6bd5df3cef62ef367dd06196e2d782ece0575aa3052', 'hex');
    const parse = new Parse(data1, data1.length);

    const res = parse.startParse();
    assert.equal(res[0].dstMac, "48-45-e6-ce-9f-af");
  });
});

test.describe('test arp', () => {
  test('arp-1', () => {
    const data = Buffer.from('ffffffffffff58696c4c472b0806000108000604000158696c4c472b0a0800010000000000000a0807dc00ffffbdd5000000000003cd617200000000', 'hex');
    const parse = new Parse(data, data.length);
    const res = parse.startParse();

    assert.equal(res[1]._type, 'arp');

  });

});

