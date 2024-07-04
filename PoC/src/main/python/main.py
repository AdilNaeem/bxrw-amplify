from fbs_runtime.application_context.PyQt5 import ApplicationContext
from PyQt5 import QtGui
from PyQt5.QtWidgets import QWidget, QApplication, QLabel, QVBoxLayout, QHBoxLayout, QPushButton
from PyQt5.QtGui import QPixmap, QPainter, QPen
import sys
from time import sleep
import cv2
from PyQt5.QtCore import pyqtSignal, pyqtSlot, Qt, QThread, QRect
import numpy as np
from pathlib import Path

class ImageLabel(QLabel):
    change_rect_signal = pyqtSignal(QRect)

    def __init__(self, parent=None):
        super(ImageLabel, self).__init__(parent)
        self.setMouseTracking(True)
        self.originalPixmap = None
        self.croppedPixmap = None
        self.start_point = None
        self.end_point = None
        self.captureRect = False
        self.drawRect = False


    def enterEvent(self, event):
        if self.captureRect:
            self.setCursor(Qt.CrossCursor)

    def leaveEvent(self, event):
        self.setCursor(Qt.ArrowCursor)

    def paintEvent(self, event):
        super(ImageLabel, self).paintEvent(event)
        if self.drawRect:
            painter = QPainter(self)
            pen = QPen(Qt.red)
            pen.setWidth(2)
            painter.setPen(pen)
            painter.drawRect(self.start_point.x(), self.start_point.y(),
                             self.end_point.x() - self.start_point.x(),
                             self.end_point.y() - self.start_point.y())

    def mousePressEvent(self, event):
        if self.captureRect and event.button() == Qt.LeftButton:
            self.start_point = event.pos()
            self.end_point = event.pos()
            self.drawRect = True

    def mouseMoveEvent(self, event):
        if event.buttons() & Qt.LeftButton:
            self.end_point = event.pos()
            self.update()

    def mouseReleaseEvent(self, event):
        if self.captureRect and event.button() == Qt.LeftButton:
            self.drawRect = False
            rect = QRect(self.start_point, self.end_point)
            rect = correct_aspect_ratio(rect)
            # tell thread about the new zoom rect
            self.change_rect_signal.emit(rect)            
            self.croppedPixmap = self.pixmap.copy(rect).scaledToWidth(self.originalPixmap.size().width())
            self.pixmap = self.croppedPixmap
            self.setPixmap(self.pixmap)
            self.setCursor(Qt.ArrowCursor)
            self.captureRect = False

def correct_aspect_ratio(rect):
    # hard-coded aspect ratio
    target_aspect_ratio = 1080/1920 # height/width
    current_width = rect.right() - rect.left()
    current_height = rect.bottom() - rect.top()
    current_aspect_ratio = current_height / current_width
    multiplier = (1/current_aspect_ratio) * target_aspect_ratio
    if multiplier < 1.:
        new_width = current_width
        new_height = current_height * multiplier
    else:
        new_width = current_width * (1/multiplier)
        new_height = current_height
    return QRect(rect.left(), rect.top(), int(new_width), int(new_height))


class VideoThread(QThread):
    change_pixmap_signal = pyqtSignal(np.ndarray)
    change_frame_info_signal = pyqtSignal(int)

    def __init__(self):
        super(VideoThread, self).__init__()
        
        self.cap1 = cv2.VideoCapture('https://do5dznmsu0r6j.cloudfront.net/Round_1-CAM_1.mp4')
        self.cap2 = cv2.VideoCapture('https://do5dznmsu0r6j.cloudfront.net/Round_1-CAM_2.mp4')
        self.cap3 = cv2.VideoCapture('https://do5dznmsu0r6j.cloudfront.net/Round_1-CAM_3.mp4')
        self.cap4 = cv2.VideoCapture('https://do5dznmsu0r6j.cloudfront.net/Round_2-CAM_1.mp4')
        self.cap5 = cv2.VideoCapture('https://do5dznmsu0r6j.cloudfront.net/Round_2-CAM_2.mp4')
        self.cap6 = cv2.VideoCapture('https://do5dznmsu0r6j.cloudfront.net/Round_2-CAM_3.mp4')
        self.cap7 = cv2.VideoCapture('https://do5dznmsu0r6j.cloudfront.net/Round_3-CAM_1.mp4')
        self.cap8 = cv2.VideoCapture('https://do5dznmsu0r6j.cloudfront.net/Round_3-CAM_2.mp4')
        self.cap9 = cv2.VideoCapture('https://do5dznmsu0r6j.cloudfront.net/Round_3-CAM_3.mp4')
         
         

         
        self.total_frames = self.cap1.get(cv2.CAP_PROP_FRAME_COUNT)
        self.cam_map = {'CAM1': self.cap1, 'CAM2': self.cap2, 'CAM3': self.cap3, 
                        'CAM4': self.cap4, 'CAM5': self.cap5, 'CAM6': self.cap6,
                        'CAM7': self.cap7, 'CAM8': self.cap8, 'CAM9': self.cap9
                       }
        self.current_cap_name = 'CAM1'
        self.current_cap = self.cap1

        self.cv_img = None
        self.current_frame_num = 0
        #self.current_rect = [[50, 50], [300, 400]]
        self.current_rect = None

        self.state = "Paused"

    def run(self):
        self._readSingleFrame()
        self.change_pixmap_signal.emit(self.cv_img)
        while True:
            # check if we need to switch videos
            if self.cam_map[self.current_cap_name] != self.current_cap:
                self.current_frame_num = self.current_cap.get(cv2.CAP_PROP_POS_FRAMES )
                self.current_cap = self.cam_map[self.current_cap_name]
                self.current_cap.set(cv2.CAP_PROP_POS_FRAMES, self.current_frame_num)
            if self.state == "Play":
                    self._readSingleFrame()
                    self.change_pixmap_signal.emit(self.cv_img)
                    self.change_frame_info_signal.emit(self.current_frame_num)
            sleep(0.02)

    def _readSingleFrame(self):
        ret, self.cv_img = self.current_cap.read()
        self.current_frame_num = int(self.current_cap.get(cv2.CAP_PROP_POS_FRAMES))
        if ret:
            if self.current_rect is not None:
                (tl_x, tl_y), (br_x,  br_y) = self.current_rect
                self.cv_img = self.cv_img[tl_y:br_y, tl_x:br_x, :]
                self.cv_img = cv2.resize(self.cv_img, (640, 360)) 

    def set_cap(self, cap_name):
        
        if cap_name in self.cam_map:
            self.current_cap_name = cap_name

    def incrementFrame(self, num_frames):
        if self.state == "Paused":
            self._readSingleFrame()
            self.change_pixmap_signal.emit(self.cv_img)
            self.change_frame_info_signal.emit(self.current_frame_num)

    def decrementFrame(self, num_frames):
        if self.state == "Paused" and self.current_frame_num > 1:
            self.current_cap.set(cv2.CAP_PROP_POS_FRAMES, self.current_frame_num - 2) # go past the target frame number so we can read it in next call
            self._readSingleFrame()
        self.change_pixmap_signal.emit(self.cv_img)
        self.change_frame_info_signal.emit(self.current_frame_num)


class App(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Qt live label demo")
        width = 640
        height = 360 
        self.disply_width = width
        self.display_height = height*2
        # create the label that holds the frame count info
        self.frame_counts_label = QLabel(" 0 of 0")
        # create the label that holds the image
        self.image_label1 = ImageLabel(self)
        self.image_label1.change_rect_signal.connect(self.update_zoom_rect)
        self.image_label1.resize(width, height)
        # create control buttons 
        self.pauseButton = QPushButton('Pause', self)
        self.playButton = QPushButton('Play', self)
        self.stepBackButton = QPushButton('<', self)
        self.stepForwardButton = QPushButton('>', self)
        self.zoomButton = QPushButton('Zoom', self)
        self.zoomButton.setCheckable(True)
        controlsHBox = QHBoxLayout()
        controlsHBox.addWidget(self.pauseButton)
        controlsHBox.addWidget(self.playButton)
        controlsHBox.addWidget(self.stepBackButton)
        controlsHBox.addWidget(self.stepForwardButton)
        controlsHBox.addWidget(self.zoomButton)

        # create a vertical box layout and add the two labels
        vboxr = QVBoxLayout()
        vboxr.addWidget(self.frame_counts_label)
        vboxr.addWidget(self.image_label1)
        vboxr.addLayout(controlsHBox)

        # create a vertical box layout and add the selector buttons
        vboxl = QVBoxLayout()
        self.cambuttons = []
        for btnName in [f'CAM{cam_id}' for cam_id in range(1,10)]:
            cambutton = QPushButton(btnName, self)
            cambutton.clicked.connect(self.setCam)
            vboxl.addWidget(cambutton)
            self.cambuttons.append(cambutton)

        # create horizontal box layout and add the 2 vertical box layouts
        hbox = QHBoxLayout()
        hbox.addLayout(vboxl)
        hbox.addLayout(vboxr)
      
        # set the vbox layout as the widgets layout
        self.setLayout(hbox)

        # create the video capture thread
        self.thread = VideoThread()
        self.thread_total_frames = self.thread.total_frames
        # connect its signal to the update_image slot
        self.thread.change_pixmap_signal.connect(self.update_image)
        self.thread.change_frame_info_signal.connect(self.update_frame_info)
        # start the thread
        self.thread.start()

        self.pauseButton.clicked.connect(self.setStatePaused)
        self.playButton.clicked.connect(self.setStatePlay)
        self.stepBackButton.clicked.connect(self.decrementFrame)
        self.stepForwardButton.clicked.connect(self.incrementFrame)
        self.zoomButton.clicked.connect(self.zoomClicked)

    def update_zoom_rect(self, rect):
        self.thread.current_rect = [[rect.left()*3, rect.top()*3],[rect.right()*3, rect.bottom()*3]]

    def update_frame_info(self, frame_count):
        self.frame_counts_label.setText(f'{int(frame_count):5} of {int(self.thread_total_frames)}') 


    @pyqtSlot(np.ndarray)
    def update_image(self, cv_img):
        """Updates the image_label with a new opencv image"""
        qt_img = self.convert_cv_qt(cv_img)
        self.image_label1.pixmap = qt_img
        self.image_label1.originalPixmap = qt_img
        self.image_label1.setPixmap(qt_img)
    
    def setStatePaused(self):
        self.thread.state = "Paused"

    def setStatePlay(self):
        self.thread.state = "Play"

    def decrementFrame(self):
        self.thread.decrementFrame(1)

    def incrementFrame(self):
        self.thread.incrementFrame(1)

    def zoomClicked(self):
        if self.thread.state == 'Paused':
            if  self.thread.current_rect is None:
                self.image_label1.captureRect = True
            else:
                self.image_label1.captureRect = False
                self.thread.current_rect = None

    def setCam(self):
        self.thread.set_cap(self.sender().text())

    def convert_cv_qt(self, cv_img):
        """Convert from an opencv image to QPixmap"""
        rgb_image = cv2.cvtColor(cv_img, cv2.COLOR_BGR2RGB)
        h, w, ch = rgb_image.shape
        bytes_per_line = ch * w
        convert_to_Qt_format = QtGui.QImage(rgb_image.data, w, h, bytes_per_line, QtGui.QImage.Format_RGB888)
        p = convert_to_Qt_format.scaled(self.disply_width, self.display_height, Qt.KeepAspectRatio)
        return QPixmap.fromImage(p)

    


if __name__ == "__main__":
    appctxt = ApplicationContext()       # 1. Instantiate ApplicationContext
    #app = QApplication(sys.argv)
    a = App()
    a.show()
    exit_code = appctxt.app.exec()      # 2. Invoke appctxt.app.exec()
    sys.exit(exit_code)



