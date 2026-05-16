# DetectX-PCB Architecture

This document outlines the multi-layered, AI-native architecture designed for high-speed PCB defect detection.

## System Overview

```mermaid
graph TB
    subgraph Factory_Floor [Factory Floor Hardware]
        A1[AOI Cameras / Optical Sensors]
        A2[PLC Line Controller]
        A3[Barcode / QR Scanner]
    end

    subgraph Edge_Compute [AI Edge Layer - On-Premise]
        B1[gRPC Ingestion Service]
        B2[YOLOv8 Engine - Object Detection]
        B3[PatchCore Engine - Anomaly Detection]
        B4[TensorRT Optimization Layer]
    end

    subgraph Core_Protocol [Backend & Protocol Layer - FastAPI]
        C1[Core Business Logic API]
        C2[PostgreSQL - Board Metadata & Audit Logs]
        C3[Redis - Hot Data & Detection Buffer]
        C4[Qdrant - Vector Defect Database]
        C5[MinIO - S3 Image Storage]
    end

    subgraph Monitoring_Layer [Frontend & Experience Layer - Next.js]
        D1[Industrial Dashboard]
        D2[3D PCB Defect Mapping - Three.js]
        D3[Operator Alert System]
    end

    subgraph Enterprise_Layer [Business & Supply Chain Integration]
        E1[MES / ERP Sync]
        E2[Quality Protocol Reports]
        E3[Continuous ML Training Pipeline]
    end

    %% Data Connections
    A1 -- "High-Res Image Stream (gRPC)" --> B1
    A3 -- "Board ID / Serial" --> B1
    B1 --> B2 & B3
    B2 & B3 --> B4
    B4 -- "Detection Payloads" --> C1
    
    %% Storage & Logic
    C1 --> C2
    C1 --> C3
    C1 --> C4
    C1 --> C5

    %% Frontend Sync
    C1 -- "Websockets / SSE" --> D1
    D1 --> D2
    D1 --> D3

    %% Feedback & Control
    D3 -- "Human Confirmation" --> C1
    C1 -- "MQTT / Modbus" --> A2
    
    %% Business Outgest
    C2 -- "Compliance Logs" --> E1
    C4 -- "Defect Similarity" --> E2
    C5 -- "Training Samples" --> E3
    E3 -- "Updated Weights (.pt)" --> B2

    %% Styling
    style Factory_Floor fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#fff
    style Edge_Compute fill:#0f172a,stroke:#10b981,stroke-width:2px,color:#fff
    style Core_Protocol fill:#1e293b,stroke:#8b5cf6,stroke-width:2px,color:#fff
    style Monitoring_Layer fill:#0f172a,stroke:#3b82f6,stroke-width:2px,color:#fff
    style Enterprise_Layer fill:#1e293b,stroke:#f59e0b,stroke-width:2px,color:#fff
```

## Layer Descriptions

### 1. Factory Floor Hardware
Integrates directly with the manufacturing line using high-resolution AOI (Automated Optical Inspection) cameras and PLC controllers for real-time board handling.

### 2. AI Edge Layer
Optimized for minimum latency. YOLOv8 handles rapid object detection while PatchCore identifies unsupervised anomalies. All models are optimized via TensorRT for edge performance.

### 3. Core Protocol Layer
The "brain" of the solution. Manages the business logic, metadata persistence, and large-scale vector similarity search for historical defect analysis.

### 4. Frontend & Experience
A premium, dark-mode dashboard providing operators with real-time alerts and 3D defect mapping for immediate action.

### 5. Enterprise Integration
Connects the shop floor to the top floor. Syncs quality data with MES/ERP systems and feeds a continuous learning pipeline for model improvement.
