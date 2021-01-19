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
    const todayString = getTodayString();

    // dropboxからinboxファイル内容取得（request-promise使おうかな）

    // dropboxから取得した内容 + 格納した変数を合わせる
    
    // dropboxのinboxファイルにテキストアップロード（上書き=overwrite）

    // レスポンスをlineに返信
}

function getTodayString() {
    const dayOfTheWeekArray = [
        'Sun',
        'Mon',
        'Tue',
        'Wed',
        'Thu',
        'Fri',
        'Sat',
    ]

    const today = new Date();
    const year = today.getFullYear().toString();
    const month = ('00' + (today.getMonth() + 1)).slice(-2).toString();
    const date = ('00' + today.getDate()).slice(-2).toString()
    const dayOfTheWeek = dayOfTheWeekArray[today.getDay()];

    const result = year + month + date + '_' + dayOfTheWeek;

    return result;
}