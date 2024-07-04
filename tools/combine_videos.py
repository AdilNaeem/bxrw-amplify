import cv2
import numpy as np
from video_writer import VideoWriter

def main(fps=50):
    combined_width = 1920*3
    combined_height = 1080*3
    combined_frame = np.zeros((combined_height, combined_width, 3), dtype=np.uint8)
    videos = get_videos()
    min_frame_count = get_min_frame_count(videos)

    writer = VideoWriter('CombinedVideo.mp4', fps=fps)
    for frame_num in range(min_frame_count):
        frames = get_next_frames(videos)
        for ix, frame in enumerate(frames):
            row = ix // 3
            col = ix % 3
            combined_frame[row*1080:(row+1)*1080, col*1920:(col+1)*1920,:] = frame
        writer.write(combined_frame)
    writer.close()

def get_videos():
    video_paths = get_video_paths()
    videos = [cv2.VideoCapture(str(video_path)) for video_path in video_paths]
    return videos

def get_video_paths():
    paths = []
    for row in range(1,4):
        for col in range(1,4):
            path = f'/Users/robineast/BOXRAW/BOXRAW Labs - Documents/Training Footage/1st April 23/Round_{row}-CAM_{col}.mp4'
            paths.append(path)
    return paths

def get_min_frame_count(videos):
    min_frame_count = 10000 # initialise to high number
    for video in videos:
        frame_count = int(video.get(cv2.CAP_PROP_FRAME_COUNT))
        if frame_count < min_frame_count:
            min_frame_count = frame_count
    return min_frame_count

def get_next_frames(videos):
    return [video.read()[1] for video in videos]

if __name__ == "__main__":
    main()
