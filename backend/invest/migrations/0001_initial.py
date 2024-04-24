# Generated by Django 4.2.11 on 2024-04-24 16:02

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('clients', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='InvestmentPortfolio',
            fields=[
                ('portfolio_id', models.AutoField(primary_key=True, serialize=False)),
                ('total_value', models.DecimalField(decimal_places=2, max_digits=10)),
                ('client', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='clients.client')),
            ],
        ),
        migrations.CreateModel(
            name='CreditAccount',
            fields=[
                ('account_id', models.AutoField(primary_key=True, serialize=False)),
                ('credit_limit', models.DecimalField(decimal_places=2, max_digits=10)),
                ('balance', models.DecimalField(decimal_places=2, max_digits=10)),
                ('client', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='clients.client')),
            ],
        ),
    ]
