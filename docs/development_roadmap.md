# Development Roadmap: DetectX-PCB (OpenCV & Ultralytics Focus)

This roadmap outlines the core Epics and Features required to build the AI-native vision pipeline using **OpenCV** and **Ultralytics (YOLOv8)**.

---

## Epic 1: AI Model Foundation (Ultralytics / YOLOv8)
*Goal: Develop a high-accuracy model specialized for micro-scale PCB defect detection.*

- **Feature 1.1: Dataset Curation & Synthetic Augmentation**
    - Use OpenCV to generate synthetic defects (e.g., "bridging" two solder points) on "Golden Samples" to expand the training set.
- **Feature 1.2: Fine-Tuning YOLOv8-Small/Nano**
    - Train Ultralytics models on PCB-specific defect classes (Short, Open, Missing, Offset).
- **Feature 1.3: Precision-Recall Optimization**
    - Calibrate confidence thresholds to minimize "False Negatives" (Escaped Defects).

## Epic 2: Real-time Vision Pipeline (OpenCV)
*Goal: Create a robust image processing engine for the production line.*

- **Feature 2.1: Multi-Source Frame Acquisition**
    - Implement OpenCV VideoCapture and GStreamer pipelines for AOI camera ingest.
- **Feature 2.2: Spatial Normalization & Alignment**
    - Use OpenCV `getPerspectiveTransform` and `warpPerspective` to align PCBs to a standard reference template.
- **Feature 2.3: Lighting & Noise Filtering**
    - Apply CLAHE (Contrast Limited Adaptive Histogram Equalization) and Gaussian blurs to handle metallic reflections on solder.

## Epic 3: Edge Inference Engine (Optimization)
*Goal: Achieve <10ms latency on the factory floor.*

- **Feature 3.1: TensorRT / OpenVINO Export**
    - Convert Ultralytics `.pt` models to optimized `.engine` (NVIDIA) or `.xml/.bin` (Intel) formats.
- **Feature 3.2: Multi-threaded Inference Wrapper**
    - Build a Python/C++ wrapper using OpenCV to handle image pre-processing in parallel with AI inference.
- **Feature 3.3: Batch Processing for High-Speed Lines**
    - Implement batching logic to process multiple board sections simultaneously.

## Epic 4: Anomaly Detection (Advanced Vision)
*Goal: Detect "Unseen" defects using unsupervised methods.*

- **Feature 4.1: PatchCore Integration**
    - Implement PatchCore (or similar anomaly detection) for identifying defects not explicitly labeled in the YOLO training set.
- **Feature 4.2: Feature Embedding Extraction**
    - Use OpenCV to extract regional descriptors and compare them against "Normal" board distributions.

## Epic 5: Visualization & UI Integration
*Goal: Provide real-time visual feedback to operators.*

- **Feature 5.1: Real-time Overlay Rendering**
    - Use OpenCV `rectangle` and `putText` to render high-speed overlays on the live stream.
- **Feature 5.2: Defect Heatmaps & Crops**
    - Automatically generate high-resolution "crops" of detected defects for operator review.

---

## Phase 1 Execution Plan (Quick Wins)
1.  **Setup**: Install `ultralytics` and `opencv-python`.
2.  **Prototype**: Create a script that takes a PCB image, aligns it (OpenCV), and runs a pre-trained YOLOv8 model.
3.  **Benchmark**: Measure the "Capture-to-Detection" latency.
