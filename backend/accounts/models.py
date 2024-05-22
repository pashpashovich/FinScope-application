from django.db import models
from clients.models import Client

class Account(models.Model):
    client_id = models.ForeignKey(Client, related_name='accounts', on_delete=models.CASCADE, db_column='client_id')
    account_num = models.IntegerField(primary_key=True)
    account_balance = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default="BYN")  
    open_date = models.DateField()
    account_activity = models.BooleanField()

    def __str__(self):
        return f"Account {self.account_num} - {self.client_id.first_name} {self.client_id.last_name}"

    @property
    def percentage(self):
        return "%.2f" % (float(self.account_balance) * 0.01)

    def withdraw(self, amount):
        self.account_balance -= amount
        self.save()

    def deposit(self, amount):
        self.account_balance += amount
        self.save()

    #def convert_balance_to(self, target_currency):
     #       exchange_rate = get_exchange_rate_by_code(self.currency)
      #      target_exchange_rate = get_exchange_rate_by_code(target_currency)
       #     converted_amount = (float(self.account_balance) / exchange_rate) * target_exchange_rate
        #    return round(converted_amount, 2)

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

class CreditAccount(Account):
    credit_limit = models.DecimalField(max_digits=10, decimal_places=2)

    def withdraw(self, amount):
        if self.account_balance - amount < -self.credit_limit:
            raise ValueError("Withdrawal amount exceeds credit limit")
        self.account_balance -= amount
        self.save()

class SocialAccount(Account):
    social_payments = models.BooleanField(default=True)

    def deposit_social_payment(self, amount):
        self.account_balance += amount
        self.save()
