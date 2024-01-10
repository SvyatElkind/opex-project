# Generated by Django 5.0.1 on 2024-01-10 12:10

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Institution',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('reg_nr', models.IntegerField(max_length=12, unique=True)),
                ('name', models.CharField(max_length=200, unique=True)),
                ('creator', models.CharField(max_length=30)),
                ('creator_position', models.CharField(max_length=200)),
                ('signer', models.CharField(max_length=30)),
                ('signer_position', models.CharField(max_length=200)),
            ],
            options={
                'db_table': 'institutions',
            },
        ),
    ]
