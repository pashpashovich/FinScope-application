from django.db import models
from clients.models import Client

class Account(models.Model):
    client_id = models.ForeignKey(Client, related_name='accounts', on_delete=models.CASCADE,db_column='client_id')
    account_num = models.IntegerField(primary_key=True)
    account_type = models.CharField(max_length=100)
    account_balance = models.DecimalField(max_digits=10, decimal_places=2)
    open_date = models.DateField()
    account_activity = models.BooleanField()

    def __str__(self):
        return f"Account {self.account_num} - {self.client_id.first_name} {self.client_id.last_name}"
    
    @property
    def percentage(self):
        return "%.2f" %(float(self.account_balance)*0.01)
    
    def withdraw(self, amount):
        self.account_balance =- amount
        pass

    def deposit(self, amount):
        self.account_balance =+ amount
        pass

class CheckingAccount(Account):
    overdraft_limit = models.DecimalField(max_digits=10, decimal_places=2)

    def withdraw(self, amount):
        if self.account_balance - amount < 0 and abs(self.account_balance - amount) > self.overdraft_limit:
            raise ValueError("Insufficient funds and exceeded overdraft limit")
        self.account_balance -= amount
        self.save()

class SavingsAccount(Account):
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2)

    def apply_interest(self):
        self.account_balance += self.account_balance * self.interest_rate
        self.save()

    


