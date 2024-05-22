from django.db import models
from users.models import User

class Client(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, limit_choices_to={'role': 'client'})
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    income = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    phone_number = models.CharField(max_length=15, null=True)
    address = models.TextField(blank=True, null=True)
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class FinancialAnalyst(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, limit_choices_to={'role': 'analyst'})
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    bank_department_number = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=15, null=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class BankDirector(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, limit_choices_to={'role': 'director'})
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=15, null=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"