import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from .models import CreditAccount, InvestmentPortfolio

@pytest.fixture
def api_client():
    return APIClient()

@pytest.mark.django_db
def test_credit_account_list_view(api_client):
    url = reverse('credit-accounts')
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK

    data = {
    }
    response = api_client.post(url, data, format='json')
    assert response.status_code == status.HTTP_201_CREATED

@pytest.mark.django_db
def test_investment_portfolio_list_view(api_client):
    url = reverse('investment-portfolios')

    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK

    data = {
    }
    response = api_client.post(url, data, format='json')
    assert response.status_code == status.HTTP_201_CREATED

