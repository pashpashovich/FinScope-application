from rest_framework import serializers
from .models import CreditAccount, InvestmentPortfolio

class CreditAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreditAccount
        fields = ['account_id', 'client_id', 'credit_limit', 'balance']


class InvestmentPortfolioSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvestmentPortfolio
        fields = ['portfolio_id', 'client_id', 'total_value']