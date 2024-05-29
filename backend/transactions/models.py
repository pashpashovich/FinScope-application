from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from accounts.models import Account
from clients.models import Client
from .api import get_сonvert
from decimal import Decimal
import pytz

class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('transfer', 'Transfer'),
        ('deposit', 'Deposit'),
        ('withdrawal', 'Withdrawal'),
    ]

    sender_account = models.ForeignKey(Account, null=True, blank=True, related_name='sent_transactions', on_delete=models.CASCADE, to_field='account_num')
    recipient_account = models.ForeignKey(Account, null=True, blank=True, related_name='received_transactions', on_delete=models.CASCADE, to_field='account_num')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='BYN')
    transaction_time = models.DateTimeField(auto_now_add=True)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)

    def convert_amount_to(self, amount, from_currency, target_currency):
        converted_amount = get_сonvert(amount,from_currency,target_currency)
        return Decimal(converted_amount).quantize(Decimal('0.01'))

    def update_account_balances(self):
        if self.transaction_type == 'transfer':
            self._update_transfer()
        elif self.transaction_type == 'deposit':
            self._update_deposit()
        elif self.transaction_type == 'withdrawal':
            self._update_withdrawal()

    def formatted_time(self):
        local_time = self.transaction_time.astimezone(pytz.timezone('Europe/Minsk'))
        return local_time.strftime('%Y-%m-%d %H:%M:%S')

    def _update_transfer(self):
        sender_amount_in_sender_currency = self.convert_amount_to(self.amount, self.currency, self.sender_account.currency)
        recipient_amount_in_recipient_currency = self.convert_amount_to(self.amount, self.currency, self.recipient_account.currency)

        self.sender_account.account_balance -= sender_amount_in_sender_currency
        self.recipient_account.account_balance += recipient_amount_in_recipient_currency
        self.sender_account.save()
        self.recipient_account.save()

    def _update_deposit(self):
        recipient_amount_in_recipient_currency = self.convert_amount_to(self.amount, self.currency, self.recipient_account.currency)
        self.recipient_account.account_balance += recipient_amount_in_recipient_currency
        self.recipient_account.save()

    def _update_withdrawal(self):
        sender_amount_in_sender_currency = self.convert_amount_to(self.amount, self.currency, self.sender_account.currency)
        self.sender_account.account_balance -= sender_amount_in_sender_currency
        self.sender_account.save()

@receiver(post_save, sender=Transaction)
def update_account_balances(sender, instance, **kwargs):
    instance.update_account_balances()

class Receipt(models.Model):
    transaction = models.OneToOneField(Transaction, on_delete=models.CASCADE)
    pdf_file = models.FileField(upload_to='receipts/')

    def __str__(self):
        return f"Receipt for Transaction {self.transaction.id}"
