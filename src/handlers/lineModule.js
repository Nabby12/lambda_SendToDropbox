'use strict'

const LINE_CHANNEL_SECRET = process.env['LINE_CHANNEL_SECRET'];
const LINE_HEADER = process.env['LINE_HEADER'];
const LINE_CHANNEL_ACCESS_TOKEN = process.env['LINE_CHANNEL_ACCESS_TOKEN'];

const LINE = require('@line/bot-sdk');
const CRYPTO = require('crypto');

async function authorize(event) {
    let signature;
    try {
        signature = CRYPTO.createHmac('sha256', LINE_CHANNEL_SECRET).update(event.body).digest('base64');
        console.log('get signature succeeded.');
    } catch (err) {
        signature = 'error'
        console.log('get signature failed.');
        // console.log(err);
    };

    const headerSignature = event.headers[LINE_HEADER];
    let result;
    if (signature === headerSignature) {
        result = { 'isAuthorize': true };
    } else {
        result = { 'isAuthorize': false };
    };

    return result;
}

function shapingText(event) {
    const eventBody = JSON.parse(event.body);
    const sendText = eventBody.events[0].message.text;

    const result = '---' + '\n' + sendText + '\n' + '---'

    return result;
}

async function reply(event, replyMessage) {
    const eventBody = JSON.parse(event.body);
    const message = {
        'type': 'text',
        'text': replyMessage
    };

    const CLIENT = new LINE.Client({ channelAccessToken: LINE_CHANNEL_ACCESS_TOKEN });
    const result = await CLIENT.replyMessage(eventBody.events[0].replyToken, message).then(response => { 
        console.log(response);
        console.log('send to line succeeded.');
        
        return { 'isReply': true };
    }).catch(err =>{
        console.log('send to line failed.');
        // console.log(err);

        return { 'isReply': false };
    });

    return result;
}

module.exports = {
    authorize,
    shapingText,
    reply
};