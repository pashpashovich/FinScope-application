from django.db import models
from clients.models import Client  

class CreditAccount(models.Model):
    account_id = models.AutoField(primary_key=True)
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    credit_limit = models.DecimalField(max_digits=10, decimal_places=2)
    balance = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"Кредитный счет {self.account_id} для клиента {self.client_id}"


class InvestmentPortfolio(models.Model):
    portfolio_id = models.AutoField(primary_key=True)
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    total_value = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"Инвестиционный портфель {self.portfolio_id} для клиента {self.client_id}"
