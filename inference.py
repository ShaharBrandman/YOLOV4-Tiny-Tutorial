import cv2
import time
import numpy as np

net = cv2.dnn.readNet("yolov4-tiny_final.weights", "yolov4-tiny.cfg")
classes = []

with open("obj.names", "r") as f:
    classes = f.read().splitlines()

cap = cv2.VideoCapture(0)

def detectObjects():
    while True:
        if not cap.isOpened():
            print("Error: Unable to open webcam.")
            break

        ret, image = cap.read()
        if not ret:
            print("Error: Unable to read frame.")
            break

        height, width, _ = image.shape

        blob = cv2.dnn.blobFromImage(image, 1/255.0, (416, 416), swapRB=True, crop=False)
        net.setInput(blob)

        output_layers = ['yolo_30', 'yolo_37']

        outs = net.forward(output_layers)

        for out in outs:
            for detection in out:
                scores = detection[5:]
                class_id = np.argmax(scores)
                confidence = scores[class_id]
                if confidence > 0.8:
                    center_x = int(detection[0] * width)
                    center_y = int(detection[1] * height)
                    w = int(detection[2] * width)
                    h = int(detection[3] * height)
                    x = int(center_x - w / 2)
                    y = int(center_y - h / 2)
                    cv2.rectangle(image, (x, y), (x + w, y + h), (0, 255, 0), 2)
                    cv2.putText(image, classes[class_id], (x, y - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

        cv2.imshow("YOLOV4 Tiny Inference", cv2.resize(image, (800, 600)))
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cv2.destroyAllWindows()

detectObjects()
