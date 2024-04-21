from django.db import models
from accounts.models import Account

class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('transfer', 'Transfer'),
        ('deposit', 'Deposit'),
        ('withdrawal', 'Withdrawal'),
    ]

    sender_account = models.ForeignKey(Account, related_name='sent_transactions', on_delete=models.CASCADE, to_field='account_num')
    recipient_account = models.ForeignKey(Account, related_name='received_transactions', on_delete=models.CASCADE, to_field='account_num')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_time = models.DateTimeField(auto_now_add=True)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
