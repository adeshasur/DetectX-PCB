import cv2
import time

def run_camera_scanner():
    """
    Opens the default computer camera and simulates a scanning process.
    Press 'q' to quit.
    """
    # Initialize the camera (0 is usually the default webcam)
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("Error: Could not open camera.")
        return

    print("Camera active. Press 'q' to stop scanning.")

    while True:
        # Capture frame-by-frame
        ret, frame = cap.read()

        if not ret:
            print("Error: Could not read frame.")
            break

        # SIMULATION: Add a scanning line animation
        h, w, _ = frame.shape
        scan_line_y = int((time.time() * 200) % h)
        cv2.line(frame, (0, scan_line_y), (w, scan_line_y), (255, 0, 0), 2)
        
        # SIMULATION: Add some metadata overlay
        cv2.putText(frame, "DetectX-PCB: ACTIVE", (20, 40), 
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        cv2.putText(frame, f"Latency: {int(time.time() % 50)}ms", (20, 80), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 1)

        # Display the resulting frame
        cv2.imshow('DetectX-PCB Scanning Simulator', frame)

        # Break the loop on 'q' key press
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # Release the capture and close windows
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    run_camera_scanner()
