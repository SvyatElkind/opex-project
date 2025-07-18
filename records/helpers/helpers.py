"""Module for helpers functions in records app."""


from typing import Union


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

    return media_record