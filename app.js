const exec = require('child_process').exec;
const kill = require('tree-kill');
const config = require('./config.json');

var sref_a = null;
var sref_v = null;

const delay = (interval) => {
    return new Promise((resolve) => {
        setTimeout(resolve, interval);
    });
}
const Start = async () => {

    //process.setMaxListeners(Infinity); // <== Important line

    while (true) {

        if (sref_a == null) {
            let call = `gst-launch-1.0 ${config.audio_path} ! audioconvert ! lamemp3enc ! shout2send ip=127.0.0.1 port=8000 password=tinker mount=tinker`
            sref_a = exec(call, (error, stdout, stderr) => {
                if (error) {
                    //console.error(`exec error: ${error}`);
                    return;
                }
                //console.log(`stdout: ${stdout}`);
                //console.log(`stderr: ${stderr}`);
            });
            console.log('stream audio start');
        }

        sref_a.on('close', (code) => {
            //console.log('audio_exit');
            kill(sref_a.pid, 'SIGTERM', function () {
                //console.log('Killed ', sref_a.pid);
                sref_a = null;
            });
        });

        await delay(config.time);

        if (sref_v == null) {
            let call = `gst-play-1.0 --videosink=kmssink ${config.video_path}`;
            sref_v = exec(call, (error, stdout, stderr) => {
                if (error) {
                    //console.error(`exec error: ${error}`);
                    return;
                }
                //console.log(`stdout: ${stdout}`);
                //console.log(`stderr: ${stderr}`);
            });
            console.log('video start');
        }

        sref_v.on('close', (code) => {
            //console.log('video_exit');
            kill(sref_v.pid, 'SIGTERM', function () {
                //console.log('Killed ', sref_v.pid);
                sref_v = null;
            });
        });

    }

}

Start();