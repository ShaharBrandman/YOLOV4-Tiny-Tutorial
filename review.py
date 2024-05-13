import cv2
import numpy as np

IMG_PATH = 'dataset/test/test-0'

img = cv2.imread(f'{IMG_PATH}.jpg')

height, width, _ = img.shape

classes = []

with open("dataset/train/_darknet.labels", "r") as f:
    classes = f.read().splitlines()

def getAnnotations(path):
    arr = []

    with open(path, 'r') as f:
        lines = f.readlines()
        for line in lines:
            values = line.strip().split()
            
            name = classes[int(values[0])]

            center_x = int(float(values[1]) * width)
            center_y = int(float(values[2]) * height)

            w = int(float(values[3]) * width)
            h = int(float(values[4]) * height)
            x = int(center_x - w / 2)
            y = int(center_y - h / 2)

            arr.append({
                'class': name,
                'x': x,
                'y': y,
                'w': w,
                'h': h
            })

    return arr

arr = getAnnotations(f'{IMG_PATH}.txt')

for e in  arr:
    cv2.rectangle(img, (e['x'], e['y']), (e['x'] + e['w'], e['y'] + e['h']), (0, 255, 0), 2)
    cv2.putText(img, e['class'], (e['x'], e['y'] - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

cv2.imshow("Review Annotations", cv2.resize(img, (800, 600)))

while True:
    if cv2.waitKey(1) & 0xFF == ord('q'):
        cv2.destroyAllWindows()
        break