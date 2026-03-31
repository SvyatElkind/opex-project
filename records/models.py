"""Module contains Records app models"""


from django.utils import timezone
import logging
import os

from django.db import models, OperationalError
from django.core.validators import MaxLengthValidator, RegexValidator
from django.core.exceptions import ValidationError
from retry import retry

from helpers.constants import AUDIO, DELAY, PHOTO, RECORD_FOLDER, TRIES, VIDEO
from items.models import Item
from records.helpers.constants import (
    ACTION,
    ACTION_TASK_LENGTH,
    ADDRESSEE,
    ADDRESSEE_ADDRESSEE_LENGTH,
    MSG_E_ITEM_DURATION_VALUE,
    MSG_E_LONG_VALUE,
    NOTES_LENGTH,
    PEROSN_LENGTH,
    READ_STATUS,
    RECORD_ACCESS_RESTRICTION_LENGTH,
    RECORD_ACCESS_RESTRICTION_NOTES_LENGTH,
    RECORD_ANNOTATION_LENGTH,
    RECORD_COLOR_LENGTH,
    RECORD_DURATION_LENGTH,
    RECORD_GROUR_LENGTH,
    RECORD_KEY_WORDS_LENGTH,
    RECORD_LANGUAGE_LENGTH,
    RECORD_NOMENCLATURE_NR_LENGTH,
    RECORD_NOTES_LENGTH,
    RECORD_REG_NR_LENGTH,
    RECORD_ACCESS_RESTRICTION_DEFAULT_VALUE,
    RECORD_SENT_REG_NR_LENGTH,
    RECORD_TECH_INFO_LENGTH,
    RECORD_TITLE_LENGTH,
    RECORD_USER_RESTRICTION_NOTES_LENGTH,
    REGEX_DURATION,
    VISA
)
from records.helpers.helpers import get_metadata_from_file
from records.helpers.validators import record_validators, validate_record_access_restriciton
import hashlib
from django.db.models.signals import post_delete
from django.dispatch import receiver


logger = logging.getLogger(__name__)


class Record(models.Model):
    """Represents 'records' table in database."""
    title = models.CharField(
        max_length=RECORD_TITLE_LENGTH,
        blank=False,
        validators=[
            MaxLengthValidator(RECORD_TITLE_LENGTH,
                               MSG_E_LONG_VALUE.format(RECORD_TITLE_LENGTH))
        ]
    )
    date = models.DateField(blank=False, null=False)
    created_date = models.DateField(blank=False, null=False)    
    sent_date = models.DateField(blank=False, null=False)    
    language = models.CharField(
        max_length=RECORD_LANGUAGE_LENGTH,
        blank=False,
        validators=[
            MaxLengthValidator(RECORD_LANGUAGE_LENGTH,
                               MSG_E_LONG_VALUE.format(RECORD_LANGUAGE_LENGTH))
        ]
    )
    annotation = models.CharField(
        max_length=RECORD_ANNOTATION_LENGTH,
        blank=True,
        validators=[
            MaxLengthValidator(RECORD_ANNOTATION_LENGTH,
                               MSG_E_LONG_VALUE.format(RECORD_ANNOTATION_LENGTH))
        ]
    )
    key_words = models.CharField(
        max_length=RECORD_KEY_WORDS_LENGTH,
        blank=True,
        validators=[
            MaxLengthValidator(RECORD_KEY_WORDS_LENGTH,
                               MSG_E_LONG_VALUE.format(RECORD_KEY_WORDS_LENGTH))
        ]
    )
    reg_nr = models.CharField(
        max_length=RECORD_REG_NR_LENGTH,
        blank=False,
        validators=[
            MaxLengthValidator(RECORD_REG_NR_LENGTH,
                               MSG_E_LONG_VALUE.format(RECORD_REG_NR_LENGTH))
        ]
    )
    sent_reg_nr = models.CharField(
        max_length=RECORD_SENT_REG_NR_LENGTH,
        blank=True,
        validators=[
            MaxLengthValidator(RECORD_SENT_REG_NR_LENGTH,
                               MSG_E_LONG_VALUE.format(RECORD_SENT_REG_NR_LENGTH))
        ]
    )
    group = models.CharField(
        max_length=RECORD_GROUR_LENGTH,
        blank=True,
        validators=[
            MaxLengthValidator(RECORD_GROUR_LENGTH,
                               MSG_E_LONG_VALUE.format(RECORD_GROUR_LENGTH))
        ]
    )
    nomenclature_nr = models.CharField(
        max_length=RECORD_NOMENCLATURE_NR_LENGTH,
        blank=False,
        validators=[
            MaxLengthValidator(RECORD_NOMENCLATURE_NR_LENGTH,
                               MSG_E_LONG_VALUE.format(RECORD_NOMENCLATURE_NR_LENGTH))
        ]
    )
    notes = models.CharField(
        max_length=RECORD_NOTES_LENGTH,
        blank=True,
        validators=[
            MaxLengthValidator(RECORD_NOTES_LENGTH,
                               MSG_E_LONG_VALUE.format(RECORD_NOTES_LENGTH))
        ]
    )
    access_restriction = models.CharField(
        max_length=RECORD_ACCESS_RESTRICTION_LENGTH,
        blank=False,
        default=RECORD_ACCESS_RESTRICTION_DEFAULT_VALUE,
        validators=[
            MaxLengthValidator(RECORD_ACCESS_RESTRICTION_LENGTH,
                               MSG_E_LONG_VALUE.format(RECORD_ACCESS_RESTRICTION_LENGTH)),
            validate_record_access_restriciton
        ]
    )
    access_restriction_notes = models.CharField(
        max_length=RECORD_ACCESS_RESTRICTION_NOTES_LENGTH,
        blank=True,
        validators=[
            MaxLengthValidator(RECORD_ACCESS_RESTRICTION_NOTES_LENGTH,
                               MSG_E_LONG_VALUE.format(RECORD_ACCESS_RESTRICTION_NOTES_LENGTH))
        ]
    )
    access_restriction_date = models.DateField(blank=True, null=True)
    user_restriction_notes = models.CharField(
        max_length=RECORD_USER_RESTRICTION_NOTES_LENGTH,
        blank=True,
        validators=[
            MaxLengthValidator(RECORD_USER_RESTRICTION_NOTES_LENGTH,
                               MSG_E_LONG_VALUE.format(RECORD_USER_RESTRICTION_NOTES_LENGTH))
        ]
    )
    tech_info = models.CharField(
        max_length=RECORD_TECH_INFO_LENGTH,
        blank=True,
        validators=[
            MaxLengthValidator(RECORD_TECH_INFO_LENGTH,
                               MSG_E_LONG_VALUE.format(RECORD_TECH_INFO_LENGTH))
        ]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    item = models.ForeignKey(Item, related_name='records', on_delete=models.CASCADE)
    

    class Meta:
        db_table = 'records'

    def __str__(self):
        return f'{self.title}'
    
    def clean(self):
        """Extend clean method with additional validations"""
        super().clean()  # Call the parent class's clean method to perform default validation.

        # Custom validation logic.
        try:
            record_validators(self)
        except ValidationError as ex:
            raise ex
    
    @staticmethod
    @retry(OperationalError, tries=TRIES, delay=DELAY, logger=logger)
    def add_record(record_dict: dict, item: Item) -> 'Record':
        """Create new record.

        Args:
            record_dict: Dictionary with record fields as keys and its values.
            item: Related Item object.
        
        Returns:
            Record instance if new record is created.
        
        Raises:
            ValidationError with error message as first argument if record is not created.
        """
        try:
            record = Record(item=item, **record_dict)
            record.full_clean()
            record.save()
        except ValidationError as ex:
            raise ex
               
        return record
    
    @retry(OperationalError, tries=TRIES, delay=DELAY, logger=logger)
    def update_record(self, record_dict: dict) -> 'Record':
        """Update record with new values.

        Args:
            record_dict: Dictionary with record fields as keys and its values.
        
        Returns:
            Record instance if record is updated.
        
        Raises:
            ValidationError with error message as first argument if record is not updated.
        """

        try:
            for field, value in record_dict.items():
                setattr(self, field, value)
            self.full_clean()
            self.save()
        except ValidationError as ex:
            raise ex
        
        return self


class BaseMediaRecord(models.Model):
    """Abstract base class for media records."""

    class Meta:
        abstract = True

    @classmethod
    @retry(OperationalError, tries=TRIES, delay=DELAY, logger=logger)
    def add_record(cls, files: list, project_folder, item) :
        """Create media record instance and attach file instance to it."""
        media_record = cls.objects.create(item=item)
        try:
            file_instances = File.add_files(files, media_record, project_folder)
        except ValidationError as ex:
            raise ex
        
        file_instance = file_instances[0]
        
        try:
            result = get_metadata_from_file(file_instance, media_record)
        except ValidationError as ex:
            #TODO Delete mediarecord and files
            raise ex
        #TODO return record id to frontend if record cant be automatically filled with metadata
        
        return result


class PhotoRecord(BaseMediaRecord):
    """Represents 'photo_records' table in database."""
    color = models.CharField(
        max_length=RECORD_COLOR_LENGTH,
        blank=True,
        validators=[
            MaxLengthValidator(RECORD_COLOR_LENGTH,
                               MSG_E_LONG_VALUE.format(RECORD_COLOR_LENGTH)),
        ]
    )
    horizontal_resolution = models.PositiveSmallIntegerField(blank=True, null=True)
    vertical_resolution = models.PositiveSmallIntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    item = models.ForeignKey(Item, related_name='photo_records', on_delete=models.CASCADE)

    class Meta:
        db_table = 'photo_records'
        
    
class VideoRecord(BaseMediaRecord):
    color = models.CharField(
        max_length=RECORD_COLOR_LENGTH,
        blank=True,
        validators=[
            MaxLengthValidator(RECORD_COLOR_LENGTH,
                               MSG_E_LONG_VALUE.format(RECORD_COLOR_LENGTH)),
        ]
    )
    duration = models.CharField(
        max_length=RECORD_DURATION_LENGTH,
        blank=True,
        validators=[
            MaxLengthValidator(RECORD_DURATION_LENGTH,
                               MSG_E_LONG_VALUE.format(RECORD_DURATION_LENGTH)),
            RegexValidator(REGEX_DURATION, MSG_E_ITEM_DURATION_VALUE)
        ]
    )
    horizontal_resolution = models.PositiveSmallIntegerField(blank=True, null=True)
    vertical_resolution = models.PositiveSmallIntegerField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    item = models.ForeignKey(Item, related_name='video_records', on_delete=models.CASCADE)


    class Meta:
        db_table = 'video_records'


class AudioRecord(BaseMediaRecord):
    duration = models.CharField(
        max_length=RECORD_DURATION_LENGTH,
        blank=True,
        validators=[
            MaxLengthValidator(RECORD_DURATION_LENGTH,
                               MSG_E_LONG_VALUE.format(RECORD_DURATION_LENGTH)),
            RegexValidator(REGEX_DURATION, MSG_E_ITEM_DURATION_VALUE)
        ]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    item = models.ForeignKey(Item, related_name='audio_records', on_delete=models.CASCADE)

    class Meta:
        db_table = 'audio_records'
    

class BaseMetadata(models.Model):
    """Abstract base class for metadata class."""

    class Meta:
        abstract = True

    @classmethod
    @retry(OperationalError, tries=TRIES, delay=DELAY, logger=logger)
    def add_metadata(cls, record: Record, data: dict):
        """Create media record instance and attach file instance to it."""
        try:
            metadata_inst = cls.objects.create(record=record, **data)
            metadata_inst.save()
        except ValidationError as ex:
            raise ex
                
        return metadata_inst


class Action(BaseMetadata):
    """Represents 'actions' table in database."""

    author = models.CharField(
        max_length=PEROSN_LENGTH,
        blank=False,
        validators=[
            MaxLengthValidator(PEROSN_LENGTH,
                               MSG_E_LONG_VALUE.format(PEROSN_LENGTH))
        ]
    )
    responsible_person = models.CharField(
        max_length=PEROSN_LENGTH,
        blank=False,
        validators=[
            MaxLengthValidator(PEROSN_LENGTH,
                               MSG_E_LONG_VALUE.format(PEROSN_LENGTH))
        ]
    )
    task = models.CharField(
        max_length=ACTION_TASK_LENGTH,
        blank=False,
        validators=[
            MaxLengthValidator(ACTION_TASK_LENGTH,
                               MSG_E_LONG_VALUE.format(ACTION_TASK_LENGTH))
        ]
    )
    due_date = models.DateField(blank=False, null=False)
    created_date = models.DateField(blank=False, null=False)
    notes = models.CharField(
        max_length=NOTES_LENGTH,
        blank=True,
        validators=[
            MaxLengthValidator(NOTES_LENGTH,
                               MSG_E_LONG_VALUE.format(NOTES_LENGTH))
        ]
    )
    record = models.ForeignKey(Record, related_name='actions', on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'actions'

    def __str__(self):
        return f'{self.task}'
    

class Addressee(BaseMetadata):
    """Represents 'addressees' table in database."""
    addressee = models.CharField(
        max_length=ADDRESSEE_ADDRESSEE_LENGTH,
        blank=False,
        validators=[
            MaxLengthValidator(ADDRESSEE_ADDRESSEE_LENGTH,
                               MSG_E_LONG_VALUE.format(ADDRESSEE_ADDRESSEE_LENGTH))
        ]
    )
    record = models.ForeignKey(Record, related_name='addressees', on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'addressees'

    def __str__(self):
        return f'{self.addressee}'


class Visa(BaseMetadata):
    """represents 'visas' table in database."""
    person = models.CharField(
        max_length=PEROSN_LENGTH,
        blank=False,
        validators=[
            MaxLengthValidator(PEROSN_LENGTH,
                               MSG_E_LONG_VALUE.format(PEROSN_LENGTH))
        ]
    )
    date = models.DateField(blank=False, null=False)
    notes = models.CharField(
        max_length=NOTES_LENGTH,
        blank=False,
        validators=[
            MaxLengthValidator(NOTES_LENGTH,
                               MSG_E_LONG_VALUE.format(NOTES_LENGTH))
        ]
    )
    record = models.ForeignKey(Record, related_name='visas', on_delete=models.CASCADE)

    class Meta:
        db_table = 'visas'

    def __str__(self):
        return f'{self.person}'
    

class ReadStatus(BaseMetadata):
    """Represents 'read_status' table in database."""
    person = models.CharField(
        max_length=PEROSN_LENGTH,
        blank=False,
        validators=[
            MaxLengthValidator(PEROSN_LENGTH,
                               MSG_E_LONG_VALUE.format(PEROSN_LENGTH))
        ]
    )
    date = models.DateField(blank=False, null=False)
    notes = models.CharField(
        max_length=NOTES_LENGTH,
        blank=False,
        validators=[
            MaxLengthValidator(NOTES_LENGTH,
                               MSG_E_LONG_VALUE.format(NOTES_LENGTH))
        ]
    )
    record = models.ForeignKey(Record, related_name='read_status', on_delete=models.CASCADE)

    class Meta:
        db_table = 'read_status'

    def __str__(self):
        return f'{self.person}'
    

class File(models.Model):
    """represents 'file' table in database"""
    path = models.FilePathField(max_length=255, blank=False)
    original_name = models.CharField(max_length=255, blank=False)
    checksum = models.CharField(max_length=64, blank=False)
    size = models.PositiveIntegerField(blank=False, null=False)
    extension = models.CharField(max_length=10, blank=False)
    record = models.ForeignKey(Record,
                               related_name='files',
                               blank=True, null=True,
                               on_delete=models.CASCADE)
    photo_record = models.ForeignKey(PhotoRecord,
                                     related_name='files',
                                     blank=True,
                                     null=True,
                                     on_delete=models.CASCADE)
    audio_record = models.ForeignKey(AudioRecord,
                                     related_name='files',
                                     blank=True,
                                     null=True,
                                     on_delete=models.CASCADE)
    video_record = models.ForeignKey(VideoRecord,
                                     related_name='files',
                                     blank=True,
                                     null=True,
                                     on_delete=models.CASCADE)
    #TODO add date

    class Meta:
        db_table = 'files'

    def __str__(self):
        return f'{self.path}, {self.original_name}'
    
    @staticmethod
    @retry(OperationalError, tries=TRIES, delay=DELAY, logger=logger)
    def add_files(files: list, record, project_folder: str) -> list:
        """Add files to record.

        Args:
            files: List of files to be added.
            project_folder: Path to the project folder where files will be stored.
        
        Returns:
            List of File instances if files are added successfully.
        
        """

        # Ensure 'records' folder exists in project folder.
        records_folder = os.path.join(project_folder, RECORD_FOLDER)
        os.makedirs(records_folder, exist_ok=True)
        
        file_instances = []
        for file in files:
            file_instance = File.objects.create(
                    original_name=file.name,
                    size=file.size,
                    extension=os.path.splitext(file.name)[1],
                    checksum=file.name
                )
            if isinstance(record, PhotoRecord):
                file_instance.photo_record = record
                file_instance.save(update_fields=['photo_record'])
            if isinstance(record, AudioRecord):
                file_instance.audio_record = record
                file_instance.save(update_fields=['audio_record'])
            if isinstance(record, VideoRecord):
                file_instance.video_record = record
                file_instance.save(update_fields=['video_record'])
            elif isinstance(record, Record):
                file_instance.record = record
                file_instance.save(update_fields=['record'])
            
            # Save file to disk with file ID as filename
            file_ext = os.path.splitext(file.name)[1]
            file_name_on_disk = f"{file_instance.id}{file_ext}"
            file_path = os.path.join(records_folder, file_name_on_disk)
            try:
                with open(file_path, 'wb+') as destination:
                    for chunk in file.chunks():
                        destination.write(chunk)
            except Exception as ex:
                file_instance.delete()
                raise ex

            # Update file path in database
            file_instance.path = file_path
            file_instance.save(update_fields=['path'])

            # Calculate checksum (SHA256) of the saved file
            checksum = file_instance.file_hash()
            
            # Check if file with same checksum already exists in database (same record scope)
            # If it does, delete the file from disk and remove the instance from database
            if isinstance(record, Record):
                if checksum in [file.checksum for file in File.objects.filter(record=record)]:
                    if os.path.exists(file_path):
                        os.remove(file_path)
                    file_instance.delete()
                    continue
            elif isinstance(record, PhotoRecord):
                if checksum in [file.checksum for file in File.objects.filter(photo_record=record)]:
                    if os.path.exists(file_path):
                        os.remove(file_path)
                    file_instance.delete()
                    continue
            elif isinstance(record, VideoRecord):
                if checksum in [file.checksum for file in File.objects.filter(video_record=record)]:
                    if os.path.exists(file_path):
                        os.remove(file_path)
                    file_instance.delete()
                    continue
            elif isinstance(record, AudioRecord):
                if checksum in [file.checksum for file in File.objects.filter(audio_record=record)]:
                    if os.path.exists(file_path):
                        os.remove(file_path)
                    file_instance.delete()
                    continue

            # Update file checksum in database
            file_instance.checksum = checksum
            file_instance.save(update_fields=['checksum'])

            
            file_instances.append(file_instance)
        
        return file_instances
    
    @retry(OperationalError, tries=TRIES, delay=DELAY, logger=logger)
    def file_hash(self) -> str:
        """Calculate SHA256 hash of a file.
        Args:
            file_path: Path to the file.
        Returns:
            Hexadecimal string of the SHA256 hash.
        """
        # Create a hash object
        hash_object = hashlib.sha256()
        # Read the file in binary mode and update hash object
        with open(self.path, 'rb') as f:
            while True:
                data = f.read(65536)  # Read in 64k chunks
                if not data:
                    break
                hash_object.update(data)
        # Get the hexadecimal representation of the hash
        return hash_object.hexdigest()
    
    @receiver(post_delete, sender='records.File')
    def delete_file_from_disk(sender, instance, **kwargs):
        # Delete file from disk after DB entry is deleted
        if instance.path and os.path.exists(instance.path):
            try:
                os.remove(instance.path)
            except Exception as ex:
                logger.error(f"Error deleting file {instance.path}: {ex}")
                raise ex


# Map of possible media record classes.
MEDIA_CLASS_MAP = {
    PHOTO: PhotoRecord,
    VIDEO: VideoRecord,
    AUDIO: AudioRecord
}

# Map of possible metadata classes.
METADATA_CLASS_MAP = {
    ACTION: Action,
    ADDRESSEE: Addressee,
    VISA: Visa,
    READ_STATUS: ReadStatus
}
