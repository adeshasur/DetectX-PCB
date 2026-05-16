try:
    import cv2
    HAS_CV2 = True
except ImportError:
    HAS_CV2 = False
import numpy as np
import time
import os

try:
    from ultralytics import YOLO
    HAS_YOLO = True
except ImportError:
    HAS_YOLO = False

class DetectXInference:
    def __init__(self, model_path="yolov8n.pt"):
        self.has_model = False
        if HAS_YOLO:
            try:
                self.model = YOLO(model_path)
                self.has_model = True
                print(f"DetectX: Real YOLOv8 model loaded from {model_path}")
            except Exception as e:
                print(f"DetectX: Failed to load real model, using mock. Error: {e}")
        else:
            print("DetectX: Ultralytics not installed, using mock inference engine.")

    def run_inference(self, image_path):
        """
        Runs inference on a PCB image.
        Returns detection results with bounding boxes.
        """
        start_time = time.time()
        
        if self.has_model:
            # Check if image is valid
            try:
                if HAS_CV2:
                    img = cv2.imread(image_path)
                    if img is None:
                        raise ValueError("Invalid image")
                
                results = self.model(image_path)[0]
                defects = []
                for box in results.boxes:
                    defects.append({
                        "class": results.names[int(box.cls[0])],
                        "confidence": float(box.conf[0]),
                        "bbox": [float(x) for x in box.xywh[0]]
                    })
                
                return {
                    "board_id": f"PCB-{os.path.basename(image_path)}-{int(time.time())}",
                    "defects": defects,
                    "inference_time": time.time() - start_time
                }
            except Exception as e:
                print(f"DetectX: Inference error or invalid image, falling back to mock: {e}")
                # Fall through to mock logic below
        
        # Enhanced Mock logic
            time.sleep(0.04) # Simulate 40ms inference
            
            # Randomly decide if there's a defect
            has_defect = np.random.random() > 0.7
            defects = []
            if has_defect:
                defect_types = ["Short Circuit", "Missing Component", "Solder Bridge", "Polarity Inversion"]
                defects.append({
                    "class": np.random.choice(defect_types),
                    "confidence": 0.85 + np.random.random() * 0.1,
                    "bbox": [100 + np.random.random()*50, 200 + np.random.random()*50, 40, 40]
                })

            return {
                "board_id": f"PCB-SIM-{int(time.time())}",
                "defects": defects,
                "inference_time": time.time() - start_time
            }

if __name__ == "__main__":
    detector = DetectXInference()
    res = detector.run_inference("dummy_pcb.jpg")
    print(res)
