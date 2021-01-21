'use strict'

const axios = require('axios');

const DROPBOX_ACCESS_TOKEN = process.env['DROPBOX_ACCESS_TOKEN'];
const DROPBOX_DIRECTORY = process.env['DROPBOX_DIRECTORY'];

async function uploadText(sendText, currentTimeString) {
    const args = JSON.stringify({
        path: `${ DROPBOX_DIRECTORY + currentTimeString }.md`,
        mode: 'add',
        autorename: true,
        mute: true,
        strict_conflict: false,
    });

    const result = await axios({
        method: 'post',
        url: 'https://content.dropboxapi.com/2/files/upload',
        data: sendText,
        headers: {
            'Authorization': `Bearer ${ DROPBOX_ACCESS_TOKEN }`,
            'Content-Type': 'application/octet-stream',
            'Dropbox-API-Arg': args
        }
    }).then(() => {
        return { 
            isOk: true,
            content: 'send to dropbox succeeded.'
        };
    }).catch(err => {
        //   console.log(err)
        return { 
            isOk: false,
            content: 'send to dropbox failed.'
        };
    });

     return result;
}

module.exports = {
    uploadText
};