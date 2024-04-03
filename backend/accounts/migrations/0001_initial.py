# Generated by Django 5.0.3 on 2024-04-02 15:56

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Account',
            fields=[
                ('account_num', models.IntegerField(primary_key=True, serialize=False)),
                ('client_id', models.IntegerField()),
                ('account_type', models.CharField(max_length=100)),
                ('account_balance', models.DecimalField(decimal_places=2, max_digits=10)),
                ('open_date', models.DateField()),
                ('account_activity', models.BooleanField()),
            ],
        ),
    ]
