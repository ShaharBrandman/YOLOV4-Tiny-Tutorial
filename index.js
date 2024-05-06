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
            resolve(Name.value);
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
                    // text: `${Type.value} is not a valid COCO label`,
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

        setTimeout(record, 250);
    }
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
        recording = false;
        webCamVideo.pause();

        recordButton.innerText = 'Click to record';
        recordButton.style.backgroundColor = 'white';

        updateObjectsDiv();
    });

    downloadButton.addEventListener('click', () => {

    });
});