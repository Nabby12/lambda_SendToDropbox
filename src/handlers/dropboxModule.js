'use strict'

const fs = require('fs');
const { send } = require('process');
const request = require('request');
const requestPromise = require('request-promise');

const DROPBOX_ACCESS_TOKEN = process.env['DROPBOX_ACCESS_TOKEN'];
const DROPBOX_DIRECTORY = process.env['DROPBOX_DIRECTORY'];

async function uploadText(sendText, currentTimeString) {
    const args = JSON.stringify({
        'path': DROPBOX_DIRECTORY + currentTimeString + '.md',
        'mode': 'add',
        'autorename': true,
        'mute': true,
    });

    const tmpFilePath = '/tmp/tmp.md';
    const tmpFile = fs.writeFileSync(tmpFilePath, sendText, 'binary');

    const options = {
        method: 'POST',
        url: 'https://content.dropboxapi.com/2/files/upload',
        data: tmpFile,
        encoding: 'binary',
        headers: {
            'Authorization': 'Bearer ' + DROPBOX_ACCESS_TOKEN,
            'Content-Type': 'application/octet-stream',
            'Dropbox-API-Arg': args,
        }
    }
    
    let result = await requestPromise.post(options)
    .then(response => {
        console.log(JSON.stringify(response));

        return {
            'isOk': true,
            'content': 'upload succeeded.'
        };
    })
    .catch(err => {
        console.log(err);
        return {
            'isOk': false,
            'content': 'upload failed.'
        };
    });

    fs.unlinkSync(tmpFilePath);

    return result;
}

module.exports = {
    uploadText
};