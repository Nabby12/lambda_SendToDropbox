'use strict'

const sinon = require('sinon');
const chai = require('chai');
chai.use(require('chai-as-promised'));
const assert = chai.assert;
const expect = chai.expect;
const { createSandbox } = require('sinon');
const proxyquire = require('proxyquire')

describe('Test for dropboxModule', () => {
    let sandbox;
    let proxyDropboxModule;
    let axiosStub;

    const dummyText = 'dummy text';
    const dummyTimeString = 'dummyTimeString';

    const expectedArgs = {
        method: 'POST',
        url: 'https://content.dropboxapi.com/2/files/upload',
        data: dummyText,
        headers: {
            'Authorization': `Bearer dummy token`,
            'Content-Type': 'application/octet-stream',
            'Dropbox-API-Arg': JSON.stringify({
                path: 'dummyDirectory/dummyTimeString.md',
                mode: 'add',
                autorename: true,
                mute: true,
                strict_conflict: false,
            })
        }
    }

    beforeEach(() => {
        sandbox = createSandbox();
        sandbox.stub(process, 'env').value({
            DROPBOX_DIRECTORY: 'dummyDirectory/',
            DROPBOX_ACCESS_TOKEN: 'dummy token',
        });

        axiosStub = sandbox.stub();

        proxyDropboxModule = proxyquire('../../../src/handlers/dropboxModule', {
            'axios': axiosStub
        });
    });
    afterEach(() => {
        sandbox.restore();
    });

    it('テキスト送信に失敗した場合、送信失敗ステータスが返る', async () => {
        axiosStub.rejects();

        const expected = { isUpdate: false };
         return expect(proxyDropboxModule.uploadText(dummyText, dummyTimeString)).to.be.fulfilled.then(result => {
            sinon.assert.calledOnce(axiosStub);
            sinon.assert.calledWith(axiosStub, expectedArgs);
            assert.deepEqual(result, expected);
        });
    });

    it('テキスト送信に成功した場合、送信成功ステータスが返る', async () => {
        axiosStub.resolves();

        const expected = { isUpdate: true };
         return expect(proxyDropboxModule.uploadText(dummyText, dummyTimeString)).to.be.fulfilled.then(result => {
            sinon.assert.calledOnce(axiosStub);
            sinon.assert.calledWith(axiosStub, expectedArgs);
            assert.deepEqual(result, expected);
        });
    });
});