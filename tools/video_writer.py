import cv2

class VideoWriter:
    def __init__(self, filename, fps=25):
        self.filename = filename
        self.fps = fps
        self.is_closed = False
        self.writer = None

    def write(self, frame):
        if not self.is_closed:
            if self.writer is None:
                height, width, _ = frame.shape
                fourcc = cv2.VideoWriter_fourcc(*'mp4v')
                self.writer = cv2.VideoWriter(self.filename, fourcc, self.fps, (width, height))
            self.writer.write(frame)

    def close(self):
        if not self.is_closed:
            self.writer.release()
            self.is_closed = True
            print(f"Video saved as {self.filename}")
