from django.urls import path
from .views import CreditAccountListView, InvestmentPortfolioListView

urlpatterns = [
    path('credit-accounts/', CreditAccountListView.as_view(), name='credit_accounts'),
    path('investment-portfolios/', InvestmentPortfolioListView.as_view(), name='investment_portfolios'),
]
