from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from accounts.models import Client, Account

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

    def update_account_balances(self):
        if self.transaction_type in ['transfer']:
            self.sender_account.account_balance -= self.amount
            self.recipient_account.account_balance +=self.amount
            self.sender_account.save()
            self.recipient_account.save()


        if self.transaction_type in ['deposit']:
            self.recipient_account.account_balance += self.amount
            self.recipient_account.save()
        
        if self.transaction_type in ['withdrawal']:
            self.sender_account.account_balance -= self.amount
            self.sender_account.save()


@receiver(post_save, sender=Transaction)
def update_account_balances(sender, instance, **kwargs):
    instance.update_account_balances()
