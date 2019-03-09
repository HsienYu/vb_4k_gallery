const mqtt = require('mqtt');
const exec = require('child_process').exec;
const kill = require('tree-kill');
const config = require('./config.json');

var sref_a = null;
var sref_v = null;

var myLog = function (lbl, vars) {
    if (verbose) console.log(lbl, vars);
}

// check for command line arguments
var args = process.argv.slice(2);
var opts = {};
for (var i = 0; i < args.length; i++) {
    if (args[i].indexOf('=') > 0) {
        var parts = args[i].split('=');
        opts[parts[0]] = parts[1];
    }
}

myLog('Command parameters: ', opts);

var verbose = (opts.verbose) ? true : config.verbose;
var url = 'tcp://';
if (opts.username && opts.password) {
    url += opts.username + ':' + opts.password + '@';
} else {
    url += config.username + ':' + config.password + '@';
}
url += (opts.host) ? opts.host : config.host;
myLog('MQTT subscriber connecting: ', url);
var client = mqtt.connect(url);
var sref = null;
var namespace = opts.namespace || config.namespace;
var playerId = opts.playerId || config.playerId;

client.on('connect', function () {
    myLog('MQTT subscriber connected: ', url);
    var topicSubscription = namespace + '/4k-player/' + playerId + '/#';
    myLog('MQTT subscribe to: ', topicSubscription);
    client.subscribe(topicSubscription);
});


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

    }

    sref_v.on('close', (code) => {
        //console.log('video_exit');
        sref_v = null;
        kill(sref_a.pid, 'SIGTERM', function () {
            //myLog('Killed audio stream with PID: ', sref_a.pid);
            sref_a = null;
            client.publish(`${config.namespace}/mqtt-media-player/#`, 'stop_4k');
        });
    });

}

const Stop = () => {
    if (sref_v && sref_v.pid > 0) {
        kill(sref_v.pid, 'SIGTERM', function () {
            //myLog('Killed video player with PID: ', sref_v.pid);
            sref_v = null;
        });
    }
}

client.on('message', function (topic, message) {
    var action = topic.toString().split('/').pop();
    myLog('MQTT subscriber action: ', action);
    var payload = message.toString();
    myLog('MQTT subscriber payload: ', payload);

    switch (action) {
        case 'start':
            Stop();
            Start();
            break;
        case 'stop':
            Stop();
            break;
    }
});

