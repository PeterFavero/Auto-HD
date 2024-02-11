import time
import os
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

#As long as main is running, the code in this file will run the processor whenever an mp4 is placed into the input directory
input_directory_path = 'C:/Users/High Definition/SharprAI/src/backend/ai/input'
# C:/Users/High Definition/SharprAI/src/backend/ai/input
# /workspace/tensorrt/input/

class MyHandler(FileSystemEventHandler):
    def on_created(self, event):
        if not event.is_directory:
            file_extension = os.path.splitext(event.src_path)[1]
            if file_extension.lower() == '.mp4' or file_extension.lower() == '.mkv':
                print("Process triggered: ", os.path.basename(event.src_path))

if __name__ == "__main__":
    event_handler = MyHandler()
    observer = Observer()
    observer.schedule(event_handler, input_directory_path, recursive=False)
    print("Watcher started: Monitoring directory", input_directory_path)
    observer.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()

    observer.join()
