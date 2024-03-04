import warnings
warnings.filterwarnings("ignore")
import sys
sys.path.append("/workspace/tensorrt/input/")
from inference_config import inference_clip

video_path = "videoname_1.mp4"
clip = inference_clip(video_path)
clip.set_output()
