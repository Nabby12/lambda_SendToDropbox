'use strict'

const sinon = require('sinon');
const chai = require('chai');
chai.use(require('chai-as-promised'));
const assert = chai.assert;
const expect = chai.expect;
const proxyquire = require('proxyquire');

const { createSandbox } = require('sinon');

describe('Test for lineModule', () => {
    let sandbox;
    let proxyLineModule;
    let cryptoStub;
    let lineClientStub;

    const dummyEvent = {
        "headers": {
            "target-header": "dummySignature"
        },
        "body": '{"events": [{"replyToken": "dummyToken", "message": {"text": "dummyText"}}]}'
    };

    beforeEach(() => {
        sandbox = createSandbox();
        sandbox.stub(process, 'env').value({
            LINE_HEADER: 'target-header',
            LINE_CHANNEL_SECRET: 'dummyToken',
        });

        cryptoStub = {};
        cryptoStub.createHmac = sandbox.stub().returns(cryptoStub);
        cryptoStub.update = sandbox.stub().returns(cryptoStub);
        cryptoStub.digest = sandbox.stub().returns(cryptoStub);

        lineClientStub = {};
        lineClientStub.Client = sandbox.stub().returns(lineClientStub);
        lineClientStub.replyMessage = sandbox.stub().returns(lineClientStub);

        proxyLineModule = proxyquire('../../../src/handlers/lineModule', {
            'crypto': cryptoStub,
            '@line/bot-sdk': lineClientStub
        });
    });
    afterEach(() => {
        sandbox.restore();
    });
    it('認証成功した場合、認証成功ステータスが返る', () => {
        cryptoStub.digest.returns('dummySignature');
        
        const expected = { 'isAuthorize': true };
        return expect(proxyLineModule.authorize(dummyEvent)).to.be.fulfilled.then(result => {
            sinon.assert.calledOnce(cryptoStub.createHmac);
            sinon.assert.calledWith(cryptoStub.createHmac, 'sha256', );
            sinon.assert.calledOnce(cryptoStub.update);
            sinon.assert.calledOnce(cryptoStub.digest);
            sinon.assert.calledWith(cryptoStub.digest, 'base64');
            sinon.assert.callOrder(cryptoStub.createHmac, cryptoStub.update, cryptoStub.digest);
            assert.deepEqual(result, expected);
        });
    });

    it('認証失敗した場合（cryptoエラー）、認証失敗ステータスが返る', () => {
        cryptoStub.digest.throws('error');
        
        const expected = { 'isAuthorize': false };
        return expect(proxyLineModule.authorize(dummyEvent)).to.be.fulfilled.then(result => {
            sinon.assert.calledOnce(cryptoStub.createHmac);
            sinon.assert.calledWith(cryptoStub.createHmac, 'sha256', );
            sinon.assert.calledOnce(cryptoStub.update);
            sinon.assert.calledOnce(cryptoStub.digest);
            sinon.assert.calledWith(cryptoStub.digest, 'base64');
            sinon.assert.callOrder(cryptoStub.createHmac, cryptoStub.update, cryptoStub.digest);
            assert.deepEqual(result, expected);
        });
    });

    it('認証失敗した場合（署名不一致）、認証失敗ステータスが返る', () => {
        cryptoStub.digest.returns('differentSignature');
        
        const expected = { 'isAuthorize': false };
        return expect(proxyLineModule.authorize(dummyEvent)).to.be.fulfilled.then(result => {
            sinon.assert.calledOnce(cryptoStub.createHmac);
            sinon.assert.calledWith(cryptoStub.createHmac, 'sha256', );
            sinon.assert.calledOnce(cryptoStub.update);
            sinon.assert.calledOnce(cryptoStub.digest);
            sinon.assert.calledWith(cryptoStub.digest, 'base64');
            sinon.assert.callOrder(cryptoStub.createHmac, cryptoStub.update, cryptoStub.digest);
            assert.deepEqual(result, expected);
        });
    });

    it('返信成功した場合、送信成功ステータスが返る', () => {
        lineClientStub.replyMessage.resolves();

        const expected = { 'isReply': true };
        return expect(proxyLineModule.reply(dummyEvent, 'replyMessage')).to.be.fulfilled.then(result => {
            sinon.assert.calledOnce(lineClientStub.Client);
            sinon.assert.calledOnce(lineClientStub.replyMessage);
            sinon.assert.callOrder(lineClientStub.Client, lineClientStub.replyMessage);
            assert.deepEqual(result, expected);
        });
    });

    it('返信失敗した場合、送信失敗ステータスが返る', () => {
        lineClientStub.replyMessage.rejects();

        const expected = { 'isReply': false };
        return expect(proxyLineModule.reply(dummyEvent, 'replyMessage')).to.be.fulfilled.then(result => {
            sinon.assert.calledOnce(lineClientStub.Client);
            sinon.assert.calledOnce(lineClientStub.replyMessage);
            sinon.assert.callOrder(lineClientStub.Client, lineClientStub.replyMessage);
            assert.deepEqual(result, expected);
        });
    });
});