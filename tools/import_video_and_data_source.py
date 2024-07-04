import argparse
import tempfile
import subprocess
import uuid
from datetime import datetime, timezone
import pandas as pd
import boto3
import cv2
from tools.video_writer import VideoWriter
from utils.s3 import upload_file

def main(video_path, segments_path, config):
    cap = cv2.VideoCapture(video_path)
    session = boto3.Session()
    dynamodb = session.resource('dynamodb')
    table = dynamodb.Table('VideoDataSource-qbqnu7l4tbexdl5a6ehopyuukq-main')
    segments = pd.read_csv(segments_path)

    for ix, (roundNum, segNum, startT, duration) in segments.iterrows():
        roundNum, segNum = int(roundNum), int(segNum)

        with tempfile.NamedTemporaryFile(suffix='.mp4') as ntf:
            filename = ntf.name
            print(filename)

            create_segment_video(
                input_path = video_path,
                output_filename = filename,
                fps = config['fps'],
                startTime = startT,
                duration = duration
            )

            folder_prefix = f'{config["boxer1"]} v {config["boxer2"]} - {config["date"][:-1]}'
            segment_filename = f'{config["boxer1"]} v {config["boxer2"]} {config["date"][:-1]} - Round {roundNum} Seg {segNum}.mp4' 
            prefix = f'{folder_prefix}/{segment_filename}' 
            upload_video(
                segment_video = filename,
                bucket = config["s3_bucket"],
                prefix = prefix
            )

        create_video_data_source_record(
            table = table,
            roundNum = roundNum,
            segNum = segNum,
            objectPrefix = prefix,
            config = config
        )

def create_segment_video(input_path, output_filename, fps, startTime, duration):
    print(f'[create_segment_video] input_path={input_path}, output_filename={output_filename}, startTime={startTime}, duration={duration}')

    # Define the ffmpeg command as a list of arguments
    ffmpeg_command = [
        'ffmpeg',
        '-i', input_path,
        '-ss', f'{int(startTime)}', 
        '-t', f'{int(duration)}', 
        output_filename,
        '-y'
    ]

    # Run the ffmpeg command
    process = subprocess.run(ffmpeg_command, check=True)
    
def upload_video(segment_video, bucket, prefix):
    print(f'[upload_video] segment_video={segment_video}, bucket={bucket}, prefix={prefix}')
    upload_file(segment_video, bucket, prefix)

def create_video_data_source_record(table, roundNum, segNum, objectPrefix, config):
    # Generate a UUID for the new record
    record_id = str(uuid.uuid4())

    # Current time in ISO Format with zero UTC offset
    current_time = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z'

    # Source URLs
    source_urls = [f'{config["source_url_prefix"]}/{objectPrefix}']
    
    # Define the new record data
    new_record = {
        'id': record_id,
        'assigned_labellers': config['assigned_labellers'],
        'boxer1': config['boxer1'],
        'boxer2': config['boxer2'],
        'createdAt': current_time, 
        'date': config['date'],
        'description': config['description'],
        'fps': 60,
        'num_camera_views': config['num_camera_views'],
        'round': int(roundNum),
        'segment': f'Seg {int(segNum)}',
        'source_urls': source_urls,
        'updatedAt': current_time,
        '__typename': 'VideoDataSource'
    }
    
    # Insert the new record into the DynamoDB table
    table.put_item(Item=new_record)

    print(f'[create_video_data_source_record] uuid={record_id}')
            

def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument('video_path')
    parser.add_argument('segments_path')
    return parser.parse_args()

if __name__ == '__main__':
    args = parse_args()

    config = {
        'boxer1': 'Stevenson',
        'boxer2': 'Valdez',
        'date': '2022-04-30Z',
        'description': 'Stevenson v Valdez - 30 Apr 2022',
        'fps': 60,
        'num_camera_views': 1,
        's3_bucket': 'com.boxrawlabs.labelling-app-test-data.unsecured',
        'source_url_prefix': 'https://do5dznmsu0r6j.cloudfront.net',
        'assigned_labellers': ['robin', 'murad']
    }

    main(
        video_path = args.video_path,
        segments_path = args.segments_path,
        config = config
    )
