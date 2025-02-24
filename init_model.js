//https://sketchfab.com/developers/viewer/examples?sample=Camera%20Animation
// api.focusOnVisibleGeometries(function(err) {
//     if (!err) {
//         window.console.log('Camera recentered');
//     }
// });

var version = '1.12.1';
var uids = ['9d73d65e706f4c6fa89a5d54307904e2', '6a63b0a50c064f2c8c0f0b2277a2363f', '7ebaf83ddec74174b821029e42a470f6', '7e8a61dd67b341e987e88299af27fe57'];
var iframeidx = 0;
var iframes = [];
for (var i = 0; i < uids.length; i++) {
    if (i == 0) {
        iframes.push(document.getElementById('api-frame'));
    } else {
        iframes.push(document.getElementById('api-frame' + String(i)));
    }

};

const modelsScreens = new Map();

var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');
canvas.width = 2;
canvas.height = 2;
var myMaterials;
var getColorAsTextureURL = function getColorAsTextureURL(color) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 2, 2);
    return canvas.toDataURL('image/png', 1.0);
};
var blackTextureURL = getColorAsTextureURL('black');
var blackTextureUID;

var coeff = 10000;
var date = Date.now();  //or use any other date
date = date + 21000;
var rounded_date = new Date(Math.round(date / coeff) * coeff);

var easings;
var cameraPosition;
var clients = [];
for (var i = 0; i < iframes.length; i++) {
    clients.push(new window.Sketchfab(version, iframes[i]));
};

var error = function error() {
    console.error('Sketchfab API error');
};
function saveBase64AsFile(base64, fileName) {
    var link = document.createElement("a");
    document.body.appendChild(link); // for Firefox
    link.setAttribute("href", base64);
    link.setAttribute("download", fileName);
    link.click();
}

var success = function success(api, uid) {
    var target = [0.0, 0.0, 0.0];
    var currentCamera = 0;
    let screenstaken = 0;
    // console.log("Initial position", init_pos)
    var _loop;
    var initPosReg = false;
    var initLen = 0;
    let api_local = api;
    // console.log('sdfas', uid)
    _loop = function loop() {
        if (!initPosReg) {
            var local_time = Date.now();
            // console.log(rounded_date);
            sleep(rounded_date - local_time);
            api_local.getCameraLookAt(function (err, camera) {
                initLen = Math.sqrt((camera.position[0]) * (camera.position[0]) +
                    (camera.position[1]) * (camera.position[1]) +
                    (camera.position[2]) * (camera.position[2]));
                console.log("Init Length", initLen);
                api_local.getTextureList(function (err, textures) {
                    if (!err) {
                        console.log(textures);
                    }
                });
                modelsScreens.set(initLen, 0);
                initPosReg = true;
            });
        }
        // console.log("currentCamera = ", currentCamera);
        if (initLen != 0) {
            currentCameraPosition = {
                eye: [cameraPosition[currentCamera % cameraPosition.length].eye[0] * initLen * 2,
                cameraPosition[currentCamera % cameraPosition.length].eye[1] * initLen * 2,
                cameraPosition[currentCamera % cameraPosition.length].eye[2] * initLen * 2 + initLen * 0.6]
            };
        } else {

            currentCameraPosition = {
                eye: [cameraPosition[currentCamera % cameraPosition.length].eye[0],
                cameraPosition[currentCamera % cameraPosition.length].eye[1],
                cameraPosition[currentCamera % cameraPosition.length].eye[2]]
            };
        };
        // console.log('=> Camera loop ', currentCameraPosition.eye, [0.0, 0.0, initLen * 0.6]);
        api_local.setCameraLookAt(currentCameraPosition.eye, [0.0, 0.0, initLen * 0.6], 2, function (err) {
            if (err) console.error(err);
            // console.log('=> Camera Start Callback');
        });
        // api.focusOnVisibleGeometries(function (err) {
        //     if (!err) {
        //         window.console.log('Camera recentered');
        //     }
        // });


        api_local.setCameraLookAtEndAnimationCallback(function (err) {
            if (err) console.error(err);
            // console.log('=> Camera End Callback');
            // console.log('initlen', initLen);
            // console.log('screenstaken', screenstaken);
            // if ((initLen != 0) && (screenstaken <= (4 + 2) * iframes.length) && (screenstaken > 0)) {
            //     if ((currentCameraPosition.eye[1] != -1) && (modelsScreens.get(initLen) <= 4)) {
            // if (currentCameraPosition.eye[1] != -1) {
            // get cpu temp
            //     var func_name = async funtion () {
            //         let data = await execute_command(payload);
            //    };

            api_local.getScreenShot(800, 800, 'image/png', function (err, result) {
                var anchor = document.createElement('a');
                anchor.href = result;
                anchor.download = 'screenshot.png';
                anchor.innerHTML = '<img width="100" height="100" src=' + result + '>download';
                // sleep(initLen);
                if ((screenstaken > 1) && (screenstaken <= cameraPosition.length + 4)) {
                    saveBase64AsFile(result, 'model_' + uid + '_tst.jpg');
                };
                // sleep(initLen);
                modelsScreens.set(initLen, modelsScreens.get(initLen) + 1);
                console.log(modelsScreens);
                // try ty insert it here
                // resolve(true);
                setTimeout(_loop, 1000);
            });

            //     };
            // };
            screenstaken++;
            console.log(uid, screenstaken);


        });
        currentCamera++;
        // api.setCameraEasing(easings[Math.floor(Math.random() * easings.length)]);

    };
    api_local.start(function () {

        api_local.addEventListener('viewerready', function () {
            var textures = [];
            api_local.addTexture(blackTextureURL, function (err, textureId) {
                blackTextureUID = textureId;
            });
            api_local.getMaterialList(function (err, materials) {
                myMaterials = materials;
                for (var i = 0; i < myMaterials.length; i++) {
                    var m = myMaterials[i];
                    textures[m.name] = m.channels.AlbedoPBR.texture;
                    // console.log(m.name, m);
                }
            });
            api_local.getRootMatrixNode(function (err, nodeID) {
                var direction = 1;
                setInterval(function () {
                }, 2000);
            });
            setTimeout(_loop, 8000);
        });
    });

};

function sleep(miliseconds) {
    const date = Date.now();

    let currentDate = null;
    do {
        currentDate = Date.now();
        // console.log(currentDate - date);
    } while (currentDate - date < miliseconds);
}

for (var i = 0; i < clients.length; i++) {
    let uid = uids[i];
    clients[i].init(uid, {
        success: function (data) { success(data, uid) },//success.apply(null, [uids[i]]),
        error: error,
        preload: 1,
        autostart: 1,
        camera: 0,
        animation_autoplay: 0
    });
};
easings = ['easeLinear', 'easeOutQuad', 'easeInQuad', 'easeInOutQuad', 'easeOutCubic', 'easeInCubic', 'easeInOutCubic', 'easeOutQuart', 'easeInQuart', 'easeInOutQuart', 'easeOutQuintic', 'easeInQuintic', 'easeInOutQuintic', 'easeOutSextic', 'easeInSextic', 'easeInOutSextic', 'easeOutSeptic', 'easeInSeptic', 'easeInOutSeptic', 'easeOutOctic', 'easeInOctic', 'easeInOutOctic', 'easeOutBack', 'easeInBack', 'easeInOutBack', 'easeOutCircle', 'easeInCircle', 'easeInOutCircle', 'easeOutElastic', 'easeInElastic', 'easeInOutElastic', 'easeOutBounce', 'easeInBounce', 'easeInOutBounce'];
cameraPosition = [{
    eye: [0, -1, 0]
}, {
    eye: [1, 0, 0]
}, {
    eye: [0, 1, 0]
},
{
    eye: [-1, 0, 0]
}
];
