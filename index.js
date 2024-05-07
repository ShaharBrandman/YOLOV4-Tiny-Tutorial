const cocoTypes = [
    "person",
    "bicycle",
    "car",
    "motorcycle",
    "airplane",
    "bus",
    "train",
    "truck",
    "boat",
    "traffic light",
    "fire hydrant",
    "stop sign",
    "parking meter",
    "bench",
    "bird",
    "cat",
    "dog",
    "horse",
    "sheep",
    "cow",
    "elephant",
    "bear",
    "zebra",
    "giraffe",
    "backpack",
    "umbrella",
    "handbag",
    "tie",
    "suitcase",
    "frisbee",
    "skis",
    "snowboard",
    "sports ball",
    "kite",
    "baseball bat",
    "baseball glove",
    "skateboard",
    "surfboard",
    "tennis racket",
    "bottle",
    "wine glass",
    "cup",
    "fork",
    "knife",
    "spoon",
    "bowl",
    "banana",
    "apple",
    "sandwich",
    "orange",
    "broccoli",
    "carrot",
    "hot dog",
    "pizza",
    "donut",
    "cake",
    "chair",
    "couch",
    "potted plant",
    "bed",
    "dining table",
    "toilet",
    "tv",
    "laptop",
    "mouse",
    "remote",
    "keyboard",
    "cell phone",
    "microwave",
    "oven",
    "toaster",
    "sink",
    "refrigerator",
    "book",
    "clock",
    "vase",
    "scissors",
    "teddy bear",
    "hair drier",
    "toothbrush"
];

class WebCam {
    static webCamStream;

    constructor() {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                WebCam.webCamStream = stream;
                const video = document.querySelector("#webCamVideo");
                video.srcObject = WebCam.webCamStream;
            })
            .catch((err) => {
                console.log(err);
            });
    }
}

let recording = false;
let currentImages = [];
let objects = [];

const trainPercentile = 0.7;
const validPercentile = 0.2;
//test percentile is all thats left obviously

const wc = new WebCam();

function getName() {
    return new Promise((resolve, reject) => {
        Swal.fire({
            title: "Enter Name",
            input: "text",
            inputAttributes: {
              autocapitalize: "off"
            },
            showCancelButton: false,
            confirmButtonText: "Submit",
            showLoaderOnConfirm: true
        }).then((Name) => {
            if (Name.value != '' && Name.value != undefined) {
                resolve(Name.value);
            }
            else {
                Swal.fire({
                    position: "center",
                    icon: "error",
                    title: "Invalid Name",
                    showConfirmButton: false,
                    timer: 1500
                });
                reject('Invalid Name');
            }
        }).catch((err) => {
            reject(err);
        })
    })
}

function getType() {
    return new Promise((resolve, reject) => {
        Swal.fire({
            title: "Enter Type",
            input: "text",
            inputAttributes: {
              autocapitalize: "off"
            },
            showCancelButton: false,
            confirmButtonText: "Submit",
            showLoaderOnConfirm: true
        }).then((Type) => {
            if (Type.value && cocoTypes.includes(Type.value)) {
                resolve(Type.value);
            }
            else {
                Swal.fire({
                    position: "center",
                    icon: "error",
                    title: "Invalid Type",
                    footer: '<a href="https://gist.github.com/aallan/fbdf008cffd1e08a619ad11a02b74fa8">Supported Types</a>',
                    showConfirmButton: false,
                    timer: 1500
                });
                reject('Invalid Type');
            }
        }).catch((err) => {
            reject(err);
        })
    })
}

function updateImagesDiv() {
    const imagesDiv = document.getElementById('imagesDiv');

    if (imagesDiv) {
        imagesDiv.innerHTML = '';

        for(let e of currentImages) {
            const newImg = new Image();
            newImg.crossOrigin = 'anonymous';
            newImg.src = e;
            imagesDiv.append(newImg);
        }
    }
}

function updateObjectsDiv() {
    const objectsDiv = document.getElementById('objectsDiv');

    if (objectsDiv) {
        getName().then((N) => {
            getType().then((T) => {
                objects.push({
                    'Name': N,
                    'Type': T,
                    'Images': currentImages
                });
        
                const object = document.createElement('div');
                object.className = 'object';
        
                const h1 = document.createElement('h1');
                
                h1.innerText = N;
                
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.src = currentImages[currentImages.length - 1];
        
                const p = document.createElement('p');
                p.innerText = T;
        
                object.append(h1);
                object.append(img);
                object.append(p);
                    
                objectsDiv.append(object);
        
                currentImages = [];
                updateImagesDiv();
            }).catch((err) => {
                console.error(err);
            })
        }).catch((err) => {
            console.error(err);
        })
    }
}

function record() {
    if (recording) {
        const videoFeed = document.getElementById('webCamVideo');
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
                
        canvas.width = videoFeed.videoWidth;
        canvas.height = videoFeed.videoHeight;
                
        context.drawImage(videoFeed, 0, 0, canvas.width, canvas.height);
            
        const imageData = canvas.toDataURL('image/jpeg');
        
        if (imageData.startsWith('data:image/jpeg;base64,')) {
            currentImages.push(imageData);
        }
            
        updateImagesDiv();

        setTimeout(record, 10);
    }
}


function savePredictionsAsZip(predictions, names) {
    predictions = predictions.sort(() => Math.random() - 0.5);

    console.log(JSON.stringify(predictions));
    console.log(JSON.stringify(names));

    const trainSize = parseInt(predictions.length * trainPercentile);
    const validSize = parseInt(predictions.length * validPercentile);

    const train = predictions.splice(0, trainSize);
    const valid = predictions.splice(trainSize, trainSize + validSize);
    const test = predictions.splice(trainSize + validSize);

    console.log(train)
}

async function makePredictions() {
    const names = [];
    let predictions = [];
    const model = await cocoSsd.load({base: 'mobilenet_v2'});
    const detectionPromises = [];

    for (let index in objects) {
        names.push(objects[index]['Name']);
        for (let img of objects[index]['Images']) {
            const tImg = new Image();
            tImg.crossOrigin = 'anonymous';
            tImg.src = img;
            // scale the image to a capable resolution for the SSD model
            tImg.width = 640;
            tImg.height = 480;
            //initilize a model detection promise for an image
            const detectionPromise = model.detect(tImg)
                .then((result) => {
                    if (result.length > 0) {
                        for (let p of result) {
                            if (p['class'] == objects[index]['Type']) {
                                predictions.push({
                                    'bbox': p['bbox'],
                                    'Name': index,
                                    'Image': img
                                });
                            }
                        }
                    }
                })
                .catch(err => console.error(err));

            //append that promise
            detectionPromises.push(detectionPromise);
        }
    }

    // Wait for all detection promises to resolve
    await Promise.all(detectionPromises).then(() => {
        savePredictionsAsZip(predictions, names);
        objects = [];
        document.getElementById('objectsDiv').innerHTML = '';
    })
}

document.addEventListener('DOMContentLoaded', () => {
    const webCamVideo = document.getElementById('webCamVideo');

    const recordButton = document.getElementById('recordButton');

    const saveButton = document.getElementById('saveButton');

    const downloadButton = document.getElementById('downloadButton');

    recordButton.addEventListener('click', () => {
        recording = !recording;

        if (recording) {
            webCamVideo.play();

            record();
            recordButton.innerText = 'Click to stop recording';
            recordButton.style.backgroundColor = 'red';
        }
        else {
            webCamVideo.pause();

            recordButton.innerText = 'Click to record';
            recordButton.style.backgroundColor = 'white';
        }
    });

    saveButton.addEventListener('click', () => {
        if (currentImages.length <= 0) {
            return Swal.fire({
                position: "center",
                icon: "error",
                title: "Can't save no images bro",
                showConfirmButton: false,
                timer: 1500
            });
        }

        recording = false;
        webCamVideo.pause();

        recordButton.innerText = 'Click to record';
        recordButton.style.backgroundColor = 'white';

        updateObjectsDiv();
    });

    downloadButton.addEventListener('click', async () => {
        if (objects.length > 0) {
            recording = false;
            webCamVideo.pause();

            recordButton.innerText = 'Click to record';
            recordButton.style.backgroundColor = 'white';

            await makePredictions();
        }
        else {
            Swal.fire({
                position: "center",
                icon: "error",
                title: "Can't download without any annotated objects",
                showConfirmButton: true,
                timer: 1250
            });
        }
    });
});