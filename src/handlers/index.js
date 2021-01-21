'use strict'

const lineModule = require('./lineModule');
const dropboxModule = require('./dropboxModule');

exports.handler = async (event) => {
    let result;
    let replyStatus;

    const lineAuthorize = await lineModule.authorize(event);
    if (!lineAuthorize.isAuthorize) {
        result = {'status': 'line authorize failed.'};
        replyStatus = await lineModule.reply(event, result.status);
        result.isReply = replyStatus.isReply;
        return result;
    };

    const sendText = lineModule.shapingText(event);
    const currentTimeString = getCurrentTimeString();

    const dropboxResult = await dropboxModule.uploadText(sendText, currentTimeString)

    replyStatus = await lineModule.reply(event, dropboxResult.content);
    result.isReply = replyStatus.isReply;
    return result;
}

function getCurrentTimeString() {
    const dayOfTheWeekArray = [
        'Sun',
        'Mon',
        'Tue',
        'Wed',
        'Thu',
        'Fri',
        'Sat',
    ];

    const currentDate = new Date(Date.now() + (new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000);

    const year = currentDate.getFullYear().toString();
    const month = ('00' + (currentDate.getMonth() + 1)).slice(-2).toString();
    const date = ('00' + currentDate.getDate()).slice(-2).toString();
    const dayOfTheWeek = dayOfTheWeekArray[currentDate.getDay()];
    const time = ('00' + currentDate.getHours()).slice(-2).toString() + 
                 ('00' + currentDate.getMinutes()).slice(-2).toString() + 
                 ('00' + currentDate.getSeconds()).slice(-2).toString();

    const result = year + month + date + '_' + dayOfTheWeek + '_' + time;

    return result;
}