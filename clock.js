
function timingInEveryday(hour, minute, callback) {
    const interval = setInterval(() => {
        const now = new Date();
        if (now.getHours() == hour
            && now.getMinutes() == minute) {
            clearInterval(interval);
            callback();

            // 定下一次闹钟
            setTimeout(() => {
                timingInEveryday(hour, minute, callback);
            }, 61000);
        }
    }, 1000);
}

module.exports = {
    timingInEveryday
};