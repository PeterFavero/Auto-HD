import time
import os
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import subprocess

#As long as main is running, the code in this file will run the processor whenever an mp4 or mkv is placed into the input directory
ai_directory_path = 'C:/Users/High Definition/SharprAI/src/ai'
input_directory_path = ai_directory_path + 'input'

class MyHandler(FileSystemEventHandler):
    def __init__(self, process):
        self.process = process
        
    def on_created(self, event):
        if not event.is_directory:
            file_extension = os.path.splitext(event.src_path)[1]
            if file_extension.lower() == '.mp4' or file_extension.lower() == '.mkv':
                print("     -- processor triggered: starting processing", os.path.basename(event.src_path), "\n")

                # Send the python command to the container's shell
                command = 'python /workspace/tensorrt/main.py\n'
                output, errors = self.process.communicate(command.strip())

                # Print the output and errors if any
                print(output)
                if errors:
                    print(errors)

                print("     -- processor terminated: finished processing", os.path.basename(event.src_path), "\n")

def start_docker_process():
    os.chdir(ai_directory_path)
    process = subprocess.Popen(["docker-compose", "run", "--rm", "-T", "vsgan_tensorrt", "/bin/bash"], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    return process

if __name__ == "__main__":

    #Cd into the proper directory, start a Docker container, and open an interactive shell
    docker_process = start_docker_process()

    #Instantiate the event handler on the proper process
    event_handler = MyHandler(docker_process)
    observer = Observer()
    observer.schedule(event_handler, input_directory_path, recursive=False)

    #Start the watcher
    print(" ------------ \n Watcher started: Monitoring directory", input_directory_path, " \n ------------ \n ")
    observer.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()

    observer.join()
