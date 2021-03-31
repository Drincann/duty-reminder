const AV = require('leancloud-storage');
const MemberList = AV.Object.extend('memberList');
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function generator(min, max) {
    const length = max - min + 1;
    return num => {
        num = (num - min) % length;
        if (num < 0) {
            num += length;
        } else if (num > length) {
            num -= length;
        }
        return num + min;
    };
}
// 另一种实现
// const mapper = (min, max, x) => (x + 1E5 * (max - min + 1) - 1) % (max - min + 1) + min;

async function init(appId, appKey) {
    AV.init({ appId, appKey, serverURL: 'https://avoscloud.com' });
}

async function addMember({ qq, name, index }) {
    const member = new MemberList();
    member.set('qq', qq);
    member.set('name', name);
    member.set('index', index);
    return await member.save();
}

async function getMember(queryIndex) {
    const query = new AV.Query('memberList')
    const { attributes: { name, qq, index }, id } = (await query.equalTo('index', queryIndex).find())[0];
    return { name, qq, index, id };
}

async function getRandomWords() {
    const query = new AV.Query('wordsList');
    const count = await query.count();

    const { attributes: { words } } = (await query.limit(1).skip(random(0, count - 1)).find())[0];
    return words;
}

async function getCurrentInfo() {
    const { attributes: { index }, id } = (await new AV.Query('currentMember').find())[0];
    return { index, id };
}


async function updateCurrent(updateIndex) {
    // 默认自增，否则用给定值
    let { index, id } = await getCurrentInfo();
    index = updateIndex ?? index + 1;

    const count = await new AV.Query('memberList').count();

    const currentMember = AV.Object.createWithoutData('currentMember', id);

    currentMember.set('index', generator(1, count)(index));
    currentMember.save();

    return currentMember.get('index');
}


module.exports = {
    init, addMember, getMember, getRandomWords, getCurrentInfo, updateCurrent
};