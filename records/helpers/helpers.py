def get_metadata_from_file(file_instance, media_record):
    media_record.validated = True
    media_record.color = "Melnbalta"
    media_record.save()
    return True