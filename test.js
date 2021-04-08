const { Bot, Middleware, Message } = require('mirai-js');
const data = require('./data');
const { timingInEveryday: timing } = require('./clock')

async function remind(bot, group) {
    let { index } = await data.getCurrentInfo();
    let { qq } = await data.getMember(index);
    let words = await data.getRandomWords();

    bot.sendMessage({
        group,
        message: new Message().addAt(qq).addText(words),
    });
}




(async () => {
    const { appid, appkey, authKey, baseUrl, qq, group } = JSON.parse(require('fs').readFileSync('./config.json'))
    // leancloud
    await data.init(appid, appkey);

    // bot
    const bot = new Bot();
    await bot.open({ baseUrl, qq, authKey, });

    bot.on('GroupMessage', new Middleware().groupFilter([Number.parseInt(group)]).textProcessor()
        .use((data, next) => {
            data.remind = () => {
                remind(bot, data.sender.group.id);
            };
            next();
        })
        .done(
            async ({ remind, text, sender: { id: friend, group: { id: group } } }) => {
                try {
                    console.log(new Date().toLocaleString() + '> ' + text);
                    const matchResult = text.match(/^\/([a-z]+)\s*(.*)/);
                    if (matchResult) {
                        if (matchResult[1] === 'skip') {
                            // 跳过
                            if (matchResult[2] === 'prev') {
                                // 上一个
                                let { index } = await data.getCurrentInfo();
                                await data.updateCurrent(index - 1);
                            } else if (matchResult[2] === 'next') {
                                //下一个
                                let { index } = await data.getCurrentInfo();
                                await data.updateCurrent(index + 1);
                            } else {
                                // 未知
                                bot.sendMessage({
                                    group,
                                    message: new Message().addAt(friend).addText('你写了个鸡掰啊，看不懂')
                                });
                            }
                        } else if (matchResult[1] === 'duty') {
                            // 提醒今日值日
                            remind();
                        }
                    }// if
                } catch (error) {
                    bot.sendMessage({
                        group,
                        message: new Message().addAt(friend).addText(error.message)
                    });
                }
            }// callback
        )// done
    );// on

    // 定时，自动事件
    timing(12, 0, () => {
        remind(bot, 795621075);
    });

    timing(19, 0, () => {
        remind(bot, 795621075);
    });

    timing(23, 59, async () => {
        //下一个
        let { index } = await data.getCurrentInfo();
        await data.updateCurrent(index + 1);
    });
})();

