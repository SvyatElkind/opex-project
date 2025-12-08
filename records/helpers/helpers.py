"""Module for helpers functions in records app."""
import json
import logging
import tempfile
import numpy as np
import math
import os
import shutil
import subprocess
from django.core.exceptions import ValidationError
from PIL import Image
from typing import Union
from django.conf import settings
from items.helpers.constants import COLOR_FIELD_VALUES


def get_metadata_from_file(
        file_instance: 'File',
        media_record: Union['PhotoRecord', 'AudioRecord', 'VideoRecord'])-> Union[
            'PhotoRecord', 'AudioRecord', 'VideoRecord']:
    """Exctract metadate from file and add it to media record.
    
    Args:
        file_instance (File): File instance to extract metadata from. 
            Can access to file through .path attribute.
        media_record (PhotoRecord, AudioRecord, VideoRecord): Media record instance to update with metadata.

    Returns:
        updated media_record with metadata.
    """
    # Get file
    # Check media type
    # Try to extract metadata
    # Update media record with metadata
    # update media_record.auto_fields with names of updated fields. example: 'color, duration'.
    # Save media record.
    # return saved media record.
    print(media_record.item.inventory.type)
    print(type(media_record).__name__)  


    if file_instance is None:
        raise ValidationError("file_instance is None. Cannot extract metadata.")
    
    auto_fields=[]
    f_path=file_instance.path
    metadata = extract_metadata(f_path)
    mt=metadata['type']
    
    objectType=type(media_record).__name__
    if objectType=="PhotoRecord" and mt != 'photo':
        raise ValidationError("File is not a photo file.")
    if objectType=="AudioRecord" and mt != 'audio':
        raise ValidationError("File is not an audio file.")  
    if objectType=="VideoRecord" and mt != 'video':
        raise ValidationError("File is not an video file.")          
    
    
    if mt in ['audio','video']:
        if float(metadata['duration'])>0:
            media_record.duration= seconds_to_hms_string(metadata['duration'])
            auto_fields.insert(len(auto_fields),"duration")
        
    if mt in ['photo','video']:
        color_detected=is_color(f_path)

        if int(metadata['width'])>0:
            media_record.horizontal_resolution = metadata['width']
            auto_fields.insert(len(auto_fields),"horizontal_resolution")
        if int(metadata['height'])>0:
            media_record.vertical_resolution = metadata['height']
            auto_fields.insert(len(auto_fields),"vertical_resolution")
        if color_detected in [True, False]:
            auto_fields.insert(len(auto_fields),"color")
            if color_detected:
                media_record.color=COLOR_FIELD_VALUES[1]      
            else:
                media_record.color=COLOR_FIELD_VALUES[0]      
    
    if len(auto_fields)>0:
        auto_fields_text = ", ".join(auto_fields)
    media_record.auto_fields=auto_fields_text        
    media_record.full_clean()
    media_record.save()
    return media_record


def is_color(input_path):
    logger = logging.getLogger(__name__)
    saturation_threshold=8

    if not os.path.exists(input_path):
        raise FileNotFoundError(f"File '{input_path}' not found.")

    temp_dir = tempfile.mkdtemp()
    try:
        if is_image_file(input_path):
            # Process single image
            resized_path = os.path.join(temp_dir, "image_96.png")
            prepare_image(input_path, resized_path)
            paths = [resized_path]
        else:
            # Process video frames
            paths = extract_frames(input_path, temp_dir)

        results = []
        for i, path in enumerate(paths, 1):
            mse, is_grayscale = grayscale_detect(path,saturation_threshold)
            results.append(mse)

        # Determine if content has significant color
        frames_mse_rms = math.sqrt(sum(s**2 for s in results) / len(results)) if results else 0.0
        is_color = frames_mse_rms > saturation_threshold
        return is_color

    except Exception as e:
        logger.error("An error occurred while processing the request", exc_info=True)
        return 1
    finally:
        shutil.rmtree(temp_dir)
    
    
def extract_metadata(file_path):
    # Run mediainfo CLI with JSON output
    MEDIINFO_PATH=os.path.join(settings.BASE_DIR,"project","helpers","utils","bin","mediainfo","MediaInfo.exe")
    command = [MEDIINFO_PATH, '--Output=JSON', file_path]
    result = subprocess.run(command, capture_output=True, text=True)
    if result.returncode != 0:
        return {}

    data = json.loads(result.stdout)
    metadata = {}
    metadata['type']='unknown'
    # parse necessary metadata fields
    tracks = data.get('media', {}).get('track', [])
    for track in tracks:
        if track.get('@type') == 'Video':
            metadata['width'] = int(track.get('Width', 0))
            metadata['height'] = int(track.get('Height', 0))
            metadata['duration'] = float(track.get('Duration', 0))   # seconds
            metadata['type']='video'

        elif track.get('@type') == 'Image':
            metadata['width'] = int(track.get('Width', 0))
            metadata['height'] = int(track.get('Height', 0))
            if metadata['type'] not in['video','audio']:
                metadata['type']='photo'
                
        elif track.get('@type') == 'Audio':
            metadata['duration'] = float(track.get('Duration', 0))   # seconds
            if metadata['type']!='video':
                metadata['type']='audio'
    #print(f"Extracted metadata: {metadata}")
    return metadata


def is_image_file(filename):
    """Check if file is a supported image format"""
    ext = os.path.splitext(filename.lower())[1]
    return ext in ['.jpg', '.jpeg', '.png', '.bmp', '.tif', '.tiff', '.webp', '.gif']

def extract_frames(video_path, output_dir):
    """Extract 4 frames at 20%, 40%, 60%, 80% of video timeline"""
    FFPROBE_PATH=os.path.join(settings.BASE_DIR,"project","helpers","utils","bin","ffmpeg","ffprobe.exe")
    FFMPEG_PATH=os.path.join(settings.BASE_DIR,"project","helpers","utils","bin","ffmpeg","ffmpeg.exe")
    try:
        # Get video duration
        cmd = [
            FFPROBE_PATH, "-v", "error", "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1", video_path
        ]
        result = subprocess.check_output(cmd, stderr=subprocess.DEVNULL).decode("utf-8")
        duration = float(result.strip())

        # Calculate frame extraction times
        times = [duration * f for f in (0.20, 0.40, 0.60, 0.80)]
        frame_paths = []

        for i, t in enumerate(times):
            frame_path = os.path.join(output_dir, f"frame_{i+1:02d}.png")
            cmd = [
                FFMPEG_PATH, "-y", "-ss", str(t), "-i", video_path,
                "-vframes", "1", "-vf", "scale=96:96", frame_path
            ]
            subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
            frame_paths.append(frame_path)

        return frame_paths
    except Exception as e:
        raise RuntimeError(f"Failed to extract frames: {e}")

def prepare_image(input_path, output_path):
    """Resize image to 96x96 using ImageMagick"""
    MAGICK_PATH=os.path.join(settings.BASE_DIR,"project","helpers","utils","bin","magick","magick.exe")
    try:
        cmd = [MAGICK_PATH, input_path, "-resize", "96x96!", output_path]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    except Exception as e:
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to resize image: {e}", exc_info=True)
        



def grayscale_detect(image_path, threshold=8):

    pil_img = Image.open(image_path).convert('RGB')
    img_array = np.array(pil_img, dtype=np.float32)

    R, G, B = img_array[:,:,0], img_array[:,:,1], img_array[:,:,2]

    # Compute opponent color channels
    rg = np.abs(R - G)
    yb = np.abs(0.5 * (R + G) - B)

    # Calculate statistics
    rg_mean, rg_std = np.mean(rg), np.std(rg)
    yb_mean, yb_std = np.mean(yb), np.std(yb)

    # Combine into colorfulness metric
    std_root = np.sqrt(rg_std**2 + yb_std**2)
    mean_root = np.sqrt(rg_mean**2 + yb_mean**2)
    colorfulness = std_root + (0.3 * mean_root)

    is_grayscale = colorfulness <= threshold
    return colorfulness, is_grayscale


def seconds_to_hms_string(seconds):
    h = int(seconds) // 3600
    m = (int(seconds) % 3600) // 60
    s = int(seconds) % 60
    return f"{h:02}:{m:02}:{s:02}"
