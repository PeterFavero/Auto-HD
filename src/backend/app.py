# Newest verison of combined

from flask import Flask, request, jsonify, url_for, send_from_directory
from pytube import YouTube
import os
from celery import Celery
import subprocess
from urllib.parse import urlparse, parse_qs
import boto3
from botocore.exceptions import NoCredentialsError
from flask_cors import CORS
from werkzeug.utils import secure_filename
import glob
import re
import time
import numpy as np

app = Flask(__name__)
CORS(app)
app.config['CELERY_BROKER_URL'] = 'redis://localhost:6379/0'
app.config['CELERY_RESULT_BACKEND'] = 'redis://localhost:6379/0'
celery = Celery(app.name, broker=app.config['CELERY_BROKER_URL'])
celery.conf.update(app.config)

# AWS ACCESS KEYS
aws_access_key_id = ''
aws_secret_access_key = ''

BASE_URL = "C:/Users/High Definition/SharprAI/src/backend/ai"
LOCK_DIR = 'C:/Users/High Definition/SharprAI/src/backend/video_locks'
input = f"{BASE_URL}/input"
output = f"{BASE_URL}/out"
local_ts_directory = f"{BASE_URL}/ts_files"

bucket_name = 'enhance'  # S3 bucket name
s3_ts_directory = "ts_files"  # S3 directory where .ts files will be stored

# Global variable to keep track of the last update time and media sequence
media_sequence = 0  # Initial media sequence

s3_client = boto3.client(
    's3', 
    region_name='us-east-2',
    aws_access_key_id=aws_access_key_id,
    aws_secret_access_key=aws_secret_access_key,
)

## -- Define your REST endpoint --
# Screen Recorder & Live Stream Plugin
ALLOWED_EXTENSIONS = {'mp4', 'webm'} #, 'webm'

# Extract the number right before ".ts" in the string.
def get_video_id(url):
    match = re.search(r'_(-?\d+)\.(?:ts|mp4|webm)$', url)
    return int(match.group(1)) if match else None

def get_video_name(url):
    match = re.search(r'(.*?)_-?\d+\.(?:ts|mp4|webm)$',url)
    return str(match.group(1)) if match else None



# val = check_lock('C:/Users/High Definition/SharprAI/src/backend/video_locks/test.txt',4)
# print(val)
#ans = get_video_name('kiasd dfas d[]ng_1.webm')
# # print(re.search(r'(\w+)_\d+\.(ts|mp4|webm)$','king_1.webm'))
#print(get_video_id('king_-1.webm'))
#print(ans)
# # def get_number_before_ts(url):
# #     match = re.search(r'_(\d+)\.ts$', url)
# #     return int(match.group(1)) if match else None
#print()


# Function to check if the directory is empty
def is_directory_empty(directory):
    return not os.listdir(directory)

#Checks to see if the lock file exists, if not, it is created with the default value of 1
def ensure_lock(file):
    for lock in os.listdir(LOCK_DIR):
        if(lock == file):
            return os.path.join(LOCK_DIR,lock)
    with open(os.path.join(LOCK_DIR,file),'x') as lock:
        lock.write(',1')
        lock.flush()
        lock.close()
    return os.path.join(LOCK_DIR,file)

#Checks to see if the lock is available for use, and if it is, return true
#Additionally, if the id is a negative number, it will delete the entire file!
def check_lock(path, id):
    vals = np.genfromtxt(path,delimiter=',',dtype=int)
    delete = id < 0
    id = abs(id)
    if(vals[-1] == id):
        if(delete):
            os.remove(path)
        else:
            with open(path,'a') as file:
                file.write(',' + str(id+1))
                file.flush()
                file.close()
        return True
    return False

##### -------------- M3u8 ------------------ ####
def append_to_playlist_and_upload(s3_object_url, playlist_name='level_4.m3u8'):
    global last_video_name, media_sequence
    playlist_path = os.path.join(local_ts_directory, playlist_name)
    
    # Extract the video_number from the new S3 object URL
    number = get_video_id(s3_object_url)
    
    # Determine if we need to reset the playlist based on the video_name
    print(f"------------------------instead number----------{number}")
    
    # If we are dealing with a new video, reset the playlist
    if number == 1:
        media_sequence = 1  # Reset the media sequence
        with open(playlist_path, 'w') as playlist_file:
            playlist_header = (
                "#EXTM3U\n"
                "#EXT-X-VERSION:3\n"
                "#EXT-X-TARGETDURATION:10\n"
                "#EXT-X-MEDIA-SEQUENCE:1\n"  # Start with media sequence 1
                "#EXT-X-PLAYLIST-TYPE:VOD\n"
            )
            playlist_file.write(playlist_header)
            # Write the first segment with discontinuity
            playlist_file.write("#EXT-X-DISCONTINUITY\n")
            playlist_file.write(f"#EXTINF:10,\n{s3_object_url}\n")

    else:
        # Append the new S3 object URL to the existing playlist
        with open(playlist_path, 'a') as playlist_file:
            playlist_file.write("#EXT-X-DISCONTINUITY\n")
            playlist_file.write(f"#EXTINF:10.000000,\n{s3_object_url}\n")

    # Upload the updated playlist to S3
    object_name = f'{s3_ts_directory}/{playlist_name}'
    upload = upload_file_to_s3(playlist_path, object_name, "x-mpegURL")
    if upload:
        s3_playlist_url = f"https://{bucket_name}.s3.us-east-2.amazonaws.com/{object_name}"
        return s3_playlist_url
    else:
        return None
    


def upload_ts_to_s3_and_delete_local(ts_path):
    print("I'm in upload_ts_to_s3_and_delete_local\n\n\n\n")
    
    # output_ts = f'/workspace/tensorrt/ts_files/{video_id}.ts'   -> ts_path
    file_name = os.path.basename(ts_path)
    object_name = f'{s3_ts_directory}/{file_name}'
    file_path = f'{local_ts_directory}/{file_name}'
    
    print(f"-------Uploading {file_name} to S3---------")
    upload = upload_file_to_s3(file_path, object_name, "MP2T") # ts is of MP2T type
    
    if upload:
        print(f"Uploaded {file_name} to S3")
        
        # Generate the S3 URL
        s3_url = f"https://{bucket_name}.s3.us-east-2.amazonaws.com/{object_name}"
        print(s3_url)
        
        # Delete the local file
        os.remove(file_path)
        print(f"Deleted local file {file_name}")
    else:
        return None
        
    return s3_url
#### ---- M3U8 Creation Finished ----


#### -------- Data Recieving --------- ####
def allowed_file(filename):
    return any(filename.endswith(ext) for ext in ALLOWED_EXTENSIONS)
      
      

     
@app.route('/upload-video', methods=['POST'])
def upload_video():
    # Check if the post request has the file part
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    file = request.files['file']
    # If the user does not select a file, the browser submits an
    # empty file without a filename.
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    if file and allowed_file(file.filename):
        print("\nGOTTTTT ITTT")
        
        # Wait until the directory is empty
        print(file.filename)
        file_name = get_video_name(file.filename) + '.txt'
        id = get_video_id(file.filename)
        while True:
            file_path = ensure_lock(file_name)
            if is_directory_empty(input) and check_lock(file_path,id):
                print("The lock is open! Proceeding with code execution.")
                break  # Exit the loop and continue with the rest of your code
            else:
                print("The lock is in use! Waiting...")
                time.sleep(2)  # Wait for 5 seconds before checking again
        
        
        
        filename = secure_filename(file.filename)
        filepath = os.path.join(input, filename)
        file.save(filepath)
        print(f"Filename: '{filename}' ---\n uploaded successfully to {input}")
        
        file_list = filename.rsplit('.', 1)   
        ts_path = process_downloaded_video(False, file_list[1].lower() == 'webm', file_list[0].lower())
        
        
        print("------------------ beginning uploading TS to S3 and deleting local files\n\n\n")
        
        # Upload .ts files to S3 and delete local files
        print("function: upload_ts_to_s3_and_delete_local")
        s3_object_url = upload_ts_to_s3_and_delete_local(ts_path)
        print("     -- finished uploading to S3 and deleting local files")
        
        print("function: append_to_playlist_and_upload")
        playlist_url = append_to_playlist_and_upload(s3_object_url)
        print(f"\n\n\nUpdated M3U8 playlist URL: {playlist_url}")
        
        # os.remove(filepath)
        return jsonify({"processed_video_url": playlist_url}) 
    else:
        return jsonify({"error": "File type not permitted"}), 400
    # return jsonify({"not_error": "File type not permitted"}), 400
    
# Video Platform Downloader    
@app.route('/process-video', methods=['POST'])
def process_video():
    video_url = request.json.get('video_url')
    parsed_url = urlparse(video_url)
    query_params = parse_qs(parsed_url.query)
    video_id = query_params.get("v")[0] if "v" in query_params else None
    filepath = download_video(video_url, video_id)
    process_downloaded_video(True)
    yt = YouTube(video_url)
    processed_video_url = generate_video_url(video_id + "_mux.mkv")
    
    print("\n\n ----- " + filepath + " ------ \n\n")
    ##os.remove(filepath)
    
    return jsonify({ "processed_video_url" : processed_video_url }) 

## -- Youtube Video Downloader --
def download_video(video_url, filename):
    if not os.path.exists(input):
        os.makedirs(input)
    yt = YouTube(video_url)
    video_stream = yt.streams.get_highest_resolution()
    video_stream.download(output_path=input, filename=filename+'.mp4')
    print(f"Video '{yt.title}' downloaded successfully to {input}")
    return (input+filename+'.mp4')
#### -------- Data Finished Recieving --------- ####



#### ------- Video Input Processing --------- ####
## -- Begin the AI --
def process_downloaded_video(isYoutube, isWebm = False, video_id = None):
    # Debugging
    if (not isYoutube and video_id == None):
        print("\n\nU SCREWED UP\n\n")
    
    print("     -- beginning processing downloaded video")
 
    # Define the working directory and the video_id
    os.chdir(BASE_URL)
    print("cded")
    
    # Command to start AI enhancer
    python_command = 'python /workspace/tensorrt/main.py'
    # Directories inside Docker image
    input_w = f'/workspace/tensorrt/input/{video_id}'
    output_mp4 = f'/workspace/tensorrt/out/{video_id}_mux.mkv'
    output_ts = f'/workspace/tensorrt/ts_files/{video_id}.ts'
    
    # Start a Docker container and open an interactive shell
    process = subprocess.Popen(
        ["docker-compose", "run", "--rm", "-T", "vsgan_tensorrt", "/bin/bash"],
        stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
    )
    
    
    if (isYoutube):
        process.communicate(python_command.strip())
    else: # Screen Record or plugin videos
        ffmpeg_command = f'ffmpeg -i {output_mp4} -c:v libx264 -c:a aac -b:a 160k -bsf:v h264_mp4toannexb -f mpegts -crf 32 {output_ts}' # convert video into a ts file
        combined_command = f'{python_command} && {ffmpeg_command}\n'
        
        if (isWebm): # if the video is a webm, also convert it into mp4
            # ffmpeg -i /workspace/tensorrt/input/videoname_1.webm -c:v libx264 -preset ultrafast -crf 23 -c:a copy /workspace/tensorrt/input/videoname_1.mp4
            convert_to_mp4_command = f'ffmpeg -i {input_w}.webm -c:v libx264 -preset ultrafast -crf 23 -c:a copy {input_w}.mp4'  # faster
            # convert_to_mp4_command = f'ffmpeg -i {input_w}.webm -c:v libx264 -preset slow -crf 22 -c:a aac -b:a 128k {input_w}.mp4' # slower (0.3x speed, but better quality?)
            combined_command = f'{convert_to_mp4_command} && {combined_command}'
            print("\n\n\n\n\n\n\n-----------------------------------------------------------trying to convert the webm into an mp4\n\n\n\n\n")
        

        # Send the combined commands to the container's shell
        output, errors = process.communicate(combined_command.strip())
        print("\nfinished enhancment & converting stream into TS\n")

        ## Output the result
        # print("Output:", output)
        # if errors:
        #     print("Errors:", errors)
        
        print("removing webm version of video")
        try:
            os.remove(f'{input}/{video_id}.webm')
        except:
            print("no webm version")
        ##print("removing enhanced output version of video")
        ##os.remove(f'{output}/{video_id}.mkv')

    print("\n\n\n-- finished processing downloaded video")
    return output_ts


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

def generate_video_url(filename):
    object_name = f'out/{filename}'
    file_path = f'{BASE_URL}/out/{filename}'
    print("-------Generating video URL---------")
    uploaded = upload_file_to_s3(file_path, object_name)
    if uploaded:
        url = f"https://{bucket_name}.s3.us-east-2.amazonaws.com/out/{filename}"
        print(url)
        return url
    else:
        return None

@app.route('/testing', methods=['POST'])
def testing():
    print("\n\ni got activiated")

    return jsonify({"processed_video_url": f"https://{bucket_name}.s3.us-east-2.amazonaws.com/master.m3u8"}) 
# https://output-sharpr.s3.us-east-2.amazonaws.com/ts_files/level_4.m3u8


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=8080)
