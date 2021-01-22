'use strict'

const sinon = require('sinon');
const chai = require('chai');
chai.use(require('chai-as-promised'));
const assert = chai.assert;
const expect = chai.expect;

const index = require('../../../src/handlers/index.js');

describe('Test for index', () => {
    it('line認証に失敗した場合、認証失敗ステータスが返る', async () => {

    });

    it('dropboxへのテキストファイル送信に失敗した場合、送信失敗ステータスが返る', async () => {

    });

    it('dropboxへのテキストファイル送信に成功した場合、アップロード成功ステータスが返る', async () => {

    });
});
