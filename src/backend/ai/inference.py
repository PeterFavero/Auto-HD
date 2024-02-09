import warnings
warnings.filterwarnings("ignore")
import sys
sys.path.append("/workspace/tensorrt/")
from inference_config import inference_clip

video_path = ""
clip = inference_clip(video_path)
clip.set_output()
