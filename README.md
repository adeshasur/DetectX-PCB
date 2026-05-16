# DetectX-PCB

DetectX-PCB is an AI-native defect detection system designed for high-speed printed circuit board (PCB) manufacturing. Leveraging state-of-the-art computer vision models, it provides real-time identification of manufacturing defects such as short circuits, missing components, and soldering anomalies.

## System Architecture

![DetectX-PCB Architecture](assets/architecture.png)

Our architecture is built on a modular, scalable framework designed for industrial integration:

1. **Data Ingestion**: High-resolution optical and AOI sensor integration.
2. **Intelligence Layer**: YOLOv8-based defect detection optimized for micro-scale PCB features.
3. **Application & Outputs**: Real-time inspection dashboards and automated factory floor alerts.
4. **Continuous Learning**: Integrated human-in-the-loop feedback to refine model accuracy over time.
5. **Infrastructure**: Edge-optimized inference for minimum latency on the production line.

## Key Features

- **Real-time Detection**: Millisecond latency for high-speed production lines.
- **High Accuracy**: Minimized false positives through advanced probabilistic decisioning.
- **Seamless Integration**: Compatible with existing PLC and manufacturing execution systems (MES).
- **Scalable MLOps**: End-to-end pipeline from data collection to model deployment.