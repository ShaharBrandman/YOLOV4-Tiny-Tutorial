# General script installation guide

## Windows
`pip install -r requirements.txt` or `py -m pip install -r requirements.txt`

# Linux / MacOS
`pip install -r requirements.txt`

# Lazyflow script installation guide
* download yolov4-tiny weights from **[this link](https://github.com/AlexeyAB/darknet/releases/download/darknet_yolo_v4_pre/yolov4-tiny.weights)**

* download the configuration file for yolov4-tiny from **[that link](https://github.com/AlexeyAB/darknet/releases/download/darknet_yolo_v3_optimal/yolov4.cfg)**

## using wget (optional)
* `wget https://github.com/AlexeyAB/darknet/releases/download/darknet_yolo_v4_pre/yolov4-tiny.weights -O yolov4-tiny.weights`
* `wget https://github.com/AlexeyAB/darknet/releases/download/darknet_yolo_v3_optimal/yolov4.cfg -O yolov4.cfg`

# Links

## Roboflow tutorial video
https://drive.google.com/file/d/1JVLc7Nd1KYkgpJp5ZO517WlBSqXQXTsc/view?usp=drive_link

## Darknet to tflite
 * https://hackmd.io/@WesleyCh3n/ByItuZfYO
 * https://github.com/hunglc007/tensorflow-yolov4-tflite
## esp32 tflite
https://github.com/tanakamasayuki/Arduino_TensorFlowLite_ESP32
