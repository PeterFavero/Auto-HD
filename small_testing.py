from flask import Flask, request, jsonify, url_for, send_from_directory
from pytube import YouTube
import os
from celery import Celery
from urllib.parse import urlparse, parse_qs
import boto3
from botocore.exceptions import NoCredentialsError
from flask_cors import CORS
from werkzeug.utils import secure_filename




aws_access_key_id = 'AKIAXYKJRWURWW6DZOU5'
aws_secret_access_key = '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'

bucket_name = 'output-sharpr'  # S3 bucket name
s3_ts_directory = "ts_files"  # S3 directory where .ts files will be stored

s3_client = boto3.client(
    's3', 
    region_name='us-east-2',
    aws_access_key_id=aws_access_key_id,
    aws_secret_access_key=aws_secret_access_key,
)


## -- Forming the output for the user --
def upload_file_to_s3(file_name, object_name=None, content_type = 'mp4'):
    if object_name is None:
        object_name = file_name

    try:
        print("-------Uploading video to S3---------")
        response = s3_client.upload_file(
            file_name, 
            bucket_name, 
            object_name,
            ExtraArgs={
                'ContentType': f'video/{content_type}',
                'ContentDisposition': 'inline'
            }
        )
    except NoCredentialsError:
        print("Credentials not available")
        return False
    return True

if __name__ == "__main__":
    playlist_path = "C:/Users/High Definition/SharprAI/src/backend/ai/ts_files/level_4.m3u8"   # Change this line
    playlist_name = os.path.basename(playlist_path) #'level_4.m3u8'    
    object_name = f'{s3_ts_directory}/{playlist_name}'
    
    upload = upload_file_to_s3(playlist_path, object_name, "x-mpegURL")
    if upload:
        s3_playlist_url = f"https://{bucket_name}.s3.us-east-2.amazonaws.com/{object_name}"
        print(s3_playlist_url)
    else:
        print('None')