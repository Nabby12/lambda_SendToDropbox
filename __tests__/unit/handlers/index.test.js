'use strict'

const sinon = require('sinon');
const chai = require('chai');
chai.use(require('chai-as-promised'));
const assert = chai.assert;
const expect = chai.expect;
const { createSandbox, FakeXMLHttpRequest } = require('sinon');
const proxyquire = require('proxyquire')

const dropboxModule = require('../../../src/handlers/dropboxModule');

describe('Test for index', () => {
    let sandbox;
    let proxyIndex;
    let lineAuthorizeStub;
    let lineReplyStub;
    let dropboxUploadTextStub;
    const proxyLineModule = {
        authorize: () => {},
        reply: () => {},
    }

    const dummyEvent = {
        "headers": {
            "target-header": "dummySignature"
        },
        "body": '{"events": [{"replyToken": "dummyToken", "message": {"text": "dummyText"}}]}'
    };

    beforeEach(() => {
        sandbox = createSandbox();

        lineAuthorizeStub = sandbox.stub(proxyLineModule, 'authorize');
        lineReplyStub = sandbox.stub(proxyLineModule, 'reply');

        proxyIndex = proxyquire('../../../src/handlers/index.js', {
            './lineModule.js': {
                'authorize': lineAuthorizeStub,
                'reply': lineReplyStub
            }
        });

        dropboxUploadTextStub = sandbox.stub(dropboxModule, 'uploadText');
    });
    afterEach(() => {
        sandbox.restore();
    });

    it('line認証失敗・返信失敗の場合、認証失敗・返信失敗ステータスが返る', async () => {
        lineAuthorizeStub.resolves({ 'isAuthorize': false });
        lineReplyStub.resolves({ 'isReply': false });
        dropboxUploadTextStub.resolves({ 'isUpdate': false });

        const expected = {
            'status': 'line authorize failed.',
            'isReply': false,
         };
         return expect(proxyIndex.handler(dummyEvent)).to.be.fulfilled.then(result => {
            sinon.assert.calledOnce(lineAuthorizeStub);
            sinon.assert.calledOnce(lineReplyStub);
            sinon.assert.notCalled(dropboxUploadTextStub);
            sinon.assert.callOrder(lineAuthorizeStub, lineReplyStub);
            assert.deepEqual(result, expected);
        });
    });

    it('line認証失敗・返信成功の場合、認証失敗・返信成功ステータスが返る', async () => {
        lineAuthorizeStub.resolves({ 'isAuthorize': false });
        lineReplyStub.resolves({ 'isReply': true });
        dropboxUploadTextStub.resolves({ 'isUpdate': false });

        const expected = {
            'status': 'line authorize failed.',
            'isReply': true,
         };
         return expect(proxyIndex.handler(dummyEvent)).to.be.fulfilled.then(result => {
            sinon.assert.calledOnce(lineAuthorizeStub);
            sinon.assert.calledOnce(lineReplyStub);
            sinon.assert.notCalled(dropboxUploadTextStub);
            sinon.assert.callOrder(lineAuthorizeStub, lineReplyStub);
            assert.deepEqual(result, expected);
        });
    });

    it('dropboxへのテキストファイル送信に失敗・line返信に失敗した場合、送信失敗・返信失敗ステータスが返る', async () => {
        lineAuthorizeStub.resolves({ 'isAuthorize': true });
        lineReplyStub.resolves({ 'isReply': false });
        dropboxUploadTextStub.resolves({ 'isUpdate': false });

        const expected = {
            'status': 'send to dropbox failed.',
            'isReply': false,
         };
         return expect(proxyIndex.handler(dummyEvent)).to.be.fulfilled.then(result => {
            sinon.assert.calledOnce(lineAuthorizeStub);
            sinon.assert.calledOnce(lineReplyStub);
            sinon.assert.calledOnce(dropboxUploadTextStub);
            sinon.assert.callOrder(lineAuthorizeStub, dropboxUploadTextStub, lineReplyStub);
            assert.deepEqual(result, expected);
        });
    });

    it('dropboxへのテキストファイル送信に失敗・line返信に成功した場合、送信失敗・返信成功ステータスが返る', async () => {
        lineAuthorizeStub.resolves({ 'isAuthorize': true });
        lineReplyStub.resolves({ 'isReply': true });
        dropboxUploadTextStub.resolves({ 'isUpdate': false });

        const expected = {
            'status': 'send to dropbox failed.',
            'isReply': true,
         };
         return expect(proxyIndex.handler(dummyEvent)).to.be.fulfilled.then(result => {
            sinon.assert.calledOnce(lineAuthorizeStub);
            sinon.assert.calledOnce(lineReplyStub);
            sinon.assert.calledOnce(dropboxUploadTextStub);
            sinon.assert.callOrder(lineAuthorizeStub, dropboxUploadTextStub, lineReplyStub);
            assert.deepEqual(result, expected);
        });
    });

    it('dropboxへのテキストファイル送信に成功・line返信に失敗した場合、アップロード成功・返信失敗ステータスが返る', async () => {
        lineAuthorizeStub.resolves({ 'isAuthorize': true });
        lineReplyStub.resolves({ 'isReply': false });
        dropboxUploadTextStub.resolves({ 'isUpdate': true });

        const expected = {
            'status': 'update text succeeded.',
            'isReply': false,
         };
         return expect(proxyIndex.handler(dummyEvent)).to.be.fulfilled.then(result => {
            sinon.assert.calledOnce(lineAuthorizeStub);
            sinon.assert.calledOnce(lineReplyStub);
            sinon.assert.calledOnce(dropboxUploadTextStub);
            sinon.assert.callOrder(lineAuthorizeStub, dropboxUploadTextStub, lineReplyStub);
            assert.deepEqual(result, expected);
        });
    });

    it('dropboxへのテキストファイル送信に成功・line返信に成功した場合、アップロード成功・返信成功ステータスが返る', async () => {
        lineAuthorizeStub.resolves({ 'isAuthorize': true });
        lineReplyStub.resolves({ 'isReply': true });
        dropboxUploadTextStub.resolves({ 'isUpdate': true });

        const expected = {
            'status': 'update text succeeded.',
            'isReply': true,
         };
         return expect(proxyIndex.handler(dummyEvent)).to.be.fulfilled.then(result => {
            sinon.assert.calledOnce(lineAuthorizeStub);
            sinon.assert.calledOnce(lineReplyStub);
            sinon.assert.calledOnce(dropboxUploadTextStub);
            sinon.assert.callOrder(lineAuthorizeStub, dropboxUploadTextStub, lineReplyStub);
            assert.deepEqual(result, expected);
        });
    });
});
