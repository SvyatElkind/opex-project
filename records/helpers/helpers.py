def get_metadata_from_file(file_instance, photo_record):
    photo_record.validated = True
    photo_record.save()
    return True