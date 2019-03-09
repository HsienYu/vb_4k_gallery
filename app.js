const exec = require('child_process').exec;
const kill = require('tree-kill');
const config = require('./config.json');

var sref_a = null;
var sref_v = null;
var state = null;

const delay = (interval) => {
    return new Promise((resolve) => {
        setTimeout(resolve, interval);
    });
}
const Start = async () => {
    //process.setMaxListeners(Infinity); // <== Important line
    //set default audio sink to minijack output
    let call = 'pacmd set-default-sink alsa_output.OnBoard_D2'
    exec(call);
    state = 1;
    while (state == 1) {

        if (sref_a == null) {
            let call = `gst-launch-1.0 ${config.audio_path} ! audioconvert ! lamemp3enc ! shout2send ip=127.0.0.1 port=8000 password=tinker mount=tinker`
            //"pulsesrc device=alsa_output.OnBoard_D2.monitor"//audio from system output
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
            sref_a = null;
        });

        await delay(config.tol);

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

            state = null;

        }
        state = null;

        sref_v.on('close', (code) => {
            //console.log('video_exit');
            sref_v = null;

        });

    }
}

const Stop = () => {
    if (sref_a && sref_a.pid > 0) {
        kill(sref_a.pid, 'SIGTERM', function () {
            myLog('Killed audio stream with PID: ', sref_a.pid);
            sref_a = null;
        });
    }
    if (sref_v && sref_v.pid > 0) {
        kill(sref_v.pid, 'SIGTERM', function () {
            myLog('Killed video player with PID: ', sref_v.pid);
            sref_v = null;
        });
    }
}

Start();

setInterval(Start, 500);