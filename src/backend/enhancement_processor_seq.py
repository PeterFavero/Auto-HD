#IMPORTS:
import os
import time
import subprocess
import modifiers as mod

#Run the mkv at input_path through the upscaler and save the output at output_path
def upscale_mkv(input_path, output_path) :
    print(f"{input_path} use unimplemented.")

    # Define the command with pipe as a list
    vspipe_command = ['vspipe', '-c', 'y4m', 'inference.py', '-']
    ffmpeg_command = ['ffmpeg', '-i', 'pipe:', output_path]

    # Set up the vspipe process
    vspipe_process = subprocess.Popen(vspipe_command, stdout=subprocess.PIPE)

    # Set up the ffmpeg process, with stdin connected to the vspipe process's stdout
    ffmpeg_process = subprocess.Popen(ffmpeg_command, stdin=vspipe_process.stdout, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    # Close the vspipe's stdout to signal that we are done with it
    vspipe_process.stdout.close()

    # Wait for the ffmpeg process to complete
    output, error = ffmpeg_process.communicate()

#Janky, not functional
def process_file(file_name, input_directory, output_directory, modification) :
    input_path = os.path.join(input_directory, file_name)
    output_path = os.path.join(output_directory, f"{os.path.splitext(file_name)[0]}_{modification.__doc__}.mkv")
    print(f"      -- Begin processing {input_path} into {output_path} with modification {modification.__doc__}:\n")

#Splits each video in input_directory into video segments that are 300 seconds long each using split_video() (300 is a magic
#number I found that worked well in tests so for now I'm just going with it, will do more thorough tests later),
#then runs process_file() on each of the video segments in inputs in parallel to ultimately process all the files in the directory
def process_directory(input_directory, output_directory, modification) :

    print(f"---- Begin processing directory '{input_directory}' into directory '{output_directory}' with modification {modification.__doc__} ----\n")
    
    start_time = time.time()
    
    video_files = [file_name for file_name in os.listdir(input_directory) 
                    if file_name.endswith((".mp4")) or file_name.endswith((".avi"))]
    video_files.sort() #Sort the videos so the ones earlier in the video will be processed first
    
    overhead_time = time.time() - start_time
    
    #process the videos sequentially
    start_time = time.time()
    for file_name in video_files : 
        process_file(file_name, input_directory, output_directory, modification)                  
    process_time = time.time() - start_time

    print(f"\n---- Finished processing directory '{input_directory}' into directory '{output_directory}' with modification {modification.__doc__} ----")
    print(f"        * overhead_time = {round(overhead_time, 3)} sec.")
    print(f"        * process_time  = {round(process_time/60, 3)} min.")

#This method will be called by watcher.py whenever a new mp4 if placed into 'inputs', such that all the files in
#inputs will be processed and outputed
def run() :
    process_directory(input_directory='inputs', 
                      output_directory='outputs', 
                      modification=mod.grayscale)

#This is a shortcut way to run process_directory() during testing, that in deployment will be deleted 
if __name__ == "__main__" :
    print()
    run()
    print()
