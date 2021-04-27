const fs = require('fs');
const AV = require('leancloud-storage');
const path = require('path');
let MemberList = null;
let WordsList = null;
let CurrentMember = null;

function readJson(path) {
  try {
    return JSON.parse(fs.readFileSync(path, { encoding: 'utf-8' }));
  } catch (error) { }
}

function saveJson(obj, path) {
  try {
    fs.writeFileSync(path, obj);
    return obj;
  } catch (error) { }
}

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
  MemberList = readJson(path.resolve(__dirname, 'memberList.json'));
  WordsList = readJson(path.resolve(__dirname, 'wordsList.json'));
  CurrentMember = readJson(path.resolve(__dirname, 'currentMember.json'));
}

async function addMember({ qq, name, index }) {
  const member = {};
  member.qq = qq;
  member.name = name;
  member.index = index;
  MemberList.push(member);
  saveJson(MemberList);
  return member;
}

async function getMember(queryIndex) {
  const { name, qq, index } = MemberList.find((val, idx, arr) => val.index == queryIndex);
  return { name, qq, index };
}

async function getRandomWords() {
  const count = WordsList.length;
  const { words } = WordsList[random(0, count - 1)];
  return words;
}

async function getCurrentInfo() {
  const { index } = CurrentMember[0];
  return { index };
}


async function updateCurrent(updateIndex) {
  // 默认自增，否则用给定值
  let { index } = CurrentMember[0];
  index = updateIndex ?? index + 1;

  const count = MemberList.length;

  CurrentMember[0].index = generator(1, count)(index);

  return CurrentMember[0].index;
}


module.exports = {
  init, addMember, getMember, getRandomWords, getCurrentInfo, updateCurrent
};