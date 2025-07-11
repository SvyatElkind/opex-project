"""Module contains Records app models"""

import logging

from django.db import IntegrityError, models, OperationalError
from django.core.validators import MaxLengthValidator
from django.core.exceptions import ValidationError
from retry import retry

from helpers.constants import DELAY, TRIES
from items.models import Item
from records.helpers.constants import (
    ACTION_TASK_LENGTH,
    ADDRESSEE_ADDRESSEE_LENGTH,
    MSG_E_LONG_VALUE,
    NOTES_LENGTH,
    PEROSN_LENGTH,
    RECORD_ACCESS_RESTRICTION_LENGTH,
    RECORD_ACCESS_RESTRICTION_NOTES_LENGTH,
    RECORD_ANNOTATION_LENGTH,
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
    RECORD_USER_RESTRICTION_NOTES_LENGTH
)
from records.helpers.validators import record_validators, validate_record_access_restriciton


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

    def delete_record(self) -> None:
        """Delete record and all related metadata."""
        try:
            self.delete()
        except IntegrityError as ex:
            raise ex
        
    def add_metadata(self, model_class_name, metadata_dict: dict):
        """
        Create related metadata (Action, Addressee, Visa, or ReadStatus) for this record.

        Args:
            model_class: The model class to create (Action, Addressee, Visa, or ReadStatus).
            metadata_dict: Dictionary with metadata fields as keys and their values.

        Returns:
            Instance of the created metadata object.

        Raises:
            ValidationError: If metadata is not created due to validation errors.
            ValueError: If model_class is not a valid related metadata model.
        """
        valid_models = {
            'action': Action,
            'addressee': Addressee,
            'visa': Visa,
            'read_status': ReadStatus
        }
        model_class = valid_models.get(model_class_name)
        if not model_class:
            raise ValueError("Invalid model_class_name for metadata creation.")

        try:
            metadata = model_class(record=self, **metadata_dict)
            metadata.full_clean()
            metadata.save()
        except ValidationError as ex:
            raise ex

        return metadata


class PhotoRecord(models.Model):
    """Class for Photo record."""
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
    # Field indicates if all metadata was provided.
    validated = models.BooleanField(default=False, blank=True)
    item = models.ForeignKey(Item, related_name='photo_records', on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'photo_records'

    @staticmethod
    def add_record(file, project_folder, item):
        # TODO make sure that there is only one file
        photo_record = PhotoRecord.objects.create(item = item)
        file_list = [file]
        try:
            file_instance = File.add_files(file_list, photo_record, project_folder)
        except ValidationError as ex:
            raise ex
        result = get_metadata_from_file(file_instance, photo_record)
        if not result:
            raise ValidationError("Not able to get metadata from file.")
        
    
class VideoRecord(models.Model):
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
    horizontal_resolution = models.PositiveSmallIntegerField(blank=True)
    vertical_resolution = models.PositiveSmallIntegerField(blank=True)
    # Field indicates if all metadata was provided.
    validated = models.BooleanField(default=False, blank=True,)
    item = models.ForeignKey(Item, related_name='video_records', on_delete=models.CASCADE)


    class Meta:
        db_table = 'video_records'


class AudioRecord(models.Model):
    duration = models.CharField(
        max_length=RECORD_DURATION_LENGTH,
        blank=True,
        validators=[
            MaxLengthValidator(RECORD_DURATION_LENGTH,
                               MSG_E_LONG_VALUE.format(RECORD_DURATION_LENGTH)),
            RegexValidator(REGEX_DURATION, MSG_E_ITEM_DURATION_VALUE)
        ]
    )
    # Field indicates if all metadata was provided
    validated = models.BooleanField(default=False, blank=True)
    item = models.ForeignKey(Item, related_name='audio_records', on_delete=models.CASCADE)

    class Meta:
        db_table = 'audio_records'
    

class Action(models.Model):
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
    
    def update_action(self, action_dict: dict) -> 'Action':
        """Update action with new values.

        Args:
            action_dict: Dictionary with action fields as keys and its values.
        
        Returns:
            Action instance if action is updated.
        
        Raises:
            ValidationError with error message as first argument if action is not updated.
        """
        try:
            for field, value in action_dict.items():
                setattr(self, field, value)
            self.full_clean()
            self.save()
        except ValidationError as ex:
            raise ex
        
        return self
    
    def delete_action(self) -> None:
        """Delete action."""
        try:
            self.delete()
        except IntegrityError as ex:
            raise ex
    

class Addressee(models.Model):
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
    
    def update_addressee(self, addressee_dict: dict) -> 'Addressee':
        """Update addressee with new values.

        Args:
            addressee_dict: Dictionary with addressee fields as keys and its values.
        
        Returns:
            Addressee instance if addressee is updated.
        
        Raises:
            ValidationError with error message as first argument if addressee is not updated.
        """
        try:
            for field, value in addressee_dict.items():
                setattr(self, field, value)
            self.full_clean()
            self.save()
        except ValidationError as ex:
            raise ex
        
        return self
    
    def delete_addressee(self) -> None:
        """Delete addressee."""
        try:
            self.delete()
        except IntegrityError as ex:
            raise ex


class Visa(models.Model):
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
    
    def update_visa(self, visa_dict: dict) -> 'Visa':
        """Update visa with new values.

        Args:
            visa_dict: Dictionary with visa fields as keys and its values.
        
        Returns:
            Visa instance if visa is updated.
        
        Raises:
            ValidationError with error message as first argument if visa is not updated.
        """
        try:
            for field, value in visa_dict.items():
                setattr(self, field, value)
            self.full_clean()
            self.save()
        except ValidationError as ex:
            raise ex
        
        return self
    

class ReadStatus(models.Model):
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
    
    def update_read_status(self, read_status_dict: dict) -> 'ReadStatus':
        """Update read status with new values.

        Args:
            read_status_dict: Dictionary with read status fields as keys and its values.
        
        Returns:
            ReadStatus instance if read status is updated.
        
        Raises:
            ValidationError with error message as first argument if read status is not updated.
        """
        try:
            for field, value in read_status_dict.items():
                setattr(self, field, value)
            self.full_clean()
            self.save()
        except ValidationError as ex:
            raise ex
        
        return self

# class MediaRecord(models.Model):
#     """Class for Photo, Audio and Video records.
    
#     """
#     colour = 1
#     format = 1
#     duration = 1
#     resolution = 1



# class File(models.Model):
#     """Class for File representation"""
#     file = models.FileField(upload_to='files/')
#     name = models.CharField(max_length=255, blank=False)
#     checksum = models.CharField(max_length=64, blank=False, unique=True)
#     size = models.PositiveIntegerField(blank=False, null=False)
#     extention = models.CharField(max_length=10, blank=False)
#     record = models.ForeignKey(Record, related_name='files', on_delete=models.CASCADE)




