const exec = require('child_process').exec;
const kill = require('tree-kill');
const config = require('./config.json');

var sref_v = null;
var sref_a = null;

const delay = (interval) => {
    return new Promise((resolve) => {
        setTimeout(resolve, interval);
    });
}
const Start = async () => {

    while (true) {
        if (sref_v == null) {
            let call = 'gst-play-1.0 --videosink=kmssink' + config.video_path;
            sref_v = exec(call);
            console.log('video start');
        }
        await delay(config.time);

        if (sref_a == null) {
            let call = `gst-launch-1.0 ${config.audio_path} ! audioconvert ! lamemp3enc ! shout2send ip=127.0.0.1 port=8000 password=tinker mount=tinker`
            sref_a = exec(call);
            console.log('stream audio start');
        }
    }

}

Start();