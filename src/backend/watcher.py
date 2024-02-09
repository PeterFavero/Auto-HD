import ai.AIPipeline as processor
import time
import os
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

#As long as main is running, the code in this file will run the processor whenever an mp4 is placed into the input directory
input_directory_path = 'inputs'

class MyHandler(FileSystemEventHandler):
    def on_created(self, event):
        if not event.is_directory and event.src_path.endswith(('.mp4')): 
            print(f"------ processor triggered: {os.path.basename(event.src_path)} added to watched directory '{input_directory_path}' : ")
            processor.run()
            print(f"------ processor terminated: {os.path.basename(event.src_path)} processed from watched directory '{input_directory_path}'.\n")

if __name__ == "__main__":
    
    event_handler = MyHandler()
    observer = Observer()
    observer.schedule(event_handler, input_directory_path, recursive=False)
    print(f"\n--------------------\nwatcher started: watching directory '{input_directory_path}'\n--------------------\n")
    observer.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()

    observer.join()



