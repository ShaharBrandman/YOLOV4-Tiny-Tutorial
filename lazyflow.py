import cv2
import os
import time
import numpy as np

net = cv2.dnn.readNet("yolov4-tiny.weights", "yolov4-tiny.cfg")
classes = []

with open("coco.names", "r") as f:
    classes = f.read().splitlines()

cap = cv2.VideoCapture(0)

blobs = []
datasets = []
names = []

output_layers = ['yolo_30', 'yolo_37']

TRAIN_PERCENTILE = 0.7
VALID_PERCENTILE = 0.2

def saveInFolder(dataset, path):
    os.makedirs(f'dataset/{path}', exist_ok=True)

    for index, obj in enumerate(dataset):
        if len(obj) > 1:
            cv2.imwrite(f'dataset/{path}/{path}-{index}.jpg', obj[0]['Image'])

            if os.path.exists(f'dataset/{path}/{path}-{index}.txt'):
                os.remove(f'dataset/{path}/{path}-{index}.txt')

            with open(f'dataset/{path}/{path}-{index}.txt', 'a') as f:
                for j in range(1, len(obj)):
                    f.write(f"{obj[j]['classId']} {obj[j]['x']} {obj[j]['y']} {obj[j]['w']} {obj[j]['h']}\n")
def saveObjects():
    #shuffle the array
    np.random.shuffle(blobs)
    
    train = blobs[:int(len(blobs) * TRAIN_PERCENTILE)]
    valid = blobs[int(len(blobs) * TRAIN_PERCENTILE) : int(len(blobs) * TRAIN_PERCENTILE) + int(len(blobs) * VALID_PERCENTILE)]
    test = blobs[int(len(blobs) * TRAIN_PERCENTILE) + int(len(blobs) * VALID_PERCENTILE):]

    print(f'total length: {len(blobs)}, train length: {len(train)}, valid length: {len(valid)}, test length: {len(test)}')

    os.makedirs('dataset/train', exist_ok=True)

    if os.path.exists('dataset/train/_darknet.labels'):
        os.remove('dataset/train/_darknet.labels')

    with open('dataset/train/_darknet.labels', 'a') as f:
        for name in names:
            f.write(f'{name}\n')

    saveInFolder(train, 'train')
    saveInFolder(valid, 'valid')
    saveInFolder(test, 'test')

def detectObjects():
    for classId, e in enumerate(datasets):
        for index, blob in enumerate(blobs):
            net.setInput(cv2.dnn.blobFromImage(blob, 1/255.0, (416, 416), swapRB=True, crop=False))

            outs = net.forward(output_layers)

            #reorganize the images array into a new array each contains the objects recognized in that image
            #with the first index being the actual image data
            blobs[index] = [
                {
                    'Image': blob
                }
            ]

            for out in outs:
                for detection in out:
                    scores = detection[5:]
                    class_id = np.argmax(scores)

                    if class_id <= len(classes) and classes[class_id] == e['Type']:
                        confidence = scores[class_id]
                        if confidence > 0.8:
                            blobs[index].append({
                                'classId': classId,
                                'x': detection[0], 
                                'y': detection[1],
                                'w': detection[2], 
                                'h': detection[3]
                            })

    saveObjects()

def capture():
    while True:
        if not cap.isOpened():
            print("Error: Unable to open webcam.")
            break

        ret, image = cap.read()
        if not ret:
            print("Error: Unable to read frame.")
            break

        blobs.append(image)
        
        cv2.imshow("Lazyflow auto annotation", cv2.resize(image, (800, 600)))

        if cv2.waitKey(1) & 0xFF == ord('q'):
            cv2.destroyAllWindows()
            N = input('Enter the label for the new object: ')

            while names.__contains__(N) or len(N) < 0 or N == ' ' or N == '':
                N = input('Enter the label for the new object: ')

            names.append(N)

            T = input('Enter the Type for the new object: ')
            while not classes.__contains__(T) or len(T) < 0 or T == ' ' or T == '':
                T = input('Enter the Type for the new object: ')
                
            datasets.append({
                'Name': N,
                'Type': T,
                'Blobs': blobs
            })

            c = input('Continue?: [y/n] ')

            if c == 'n':
                break
            else:
                blobs.clear()

    detectObjects()

capture()