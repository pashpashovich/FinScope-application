from django.db import models

class Account(models.Model):
    account_num = models.IntegerField(primary_key=True)
    client_id = models.IntegerField()
    account_type = models.CharField(max_length=100)
    account_balance = models.DecimalField(max_digits=10, decimal_places=2)
    open_date = models.DateField()
    account_activity = models.BooleanField()

    def __str__(self):
        return f"Account {self.account_num}"
    
    @property
    def percentage(self):
        return "%.2f" %(float(self.account_balance)*0.01)
    
   
    


