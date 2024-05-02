import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from .models import Transaction
from accounts.models import Account
from clients.models import Client
from datetime import datetime


@pytest.fixture
def sample_transaction():
    return Transaction.objects.create(
        sender_account="sender_account",
        recipient_account="recipient_account",
        amount=100.0,
        date="2024-05-01"
    )

@pytest.fixture
def api_client():
    return APIClient()

@pytest.mark.django_db
def test_transaction_list_create(api_client):
    url = reverse('transaction-list')
    sender_client = Client.objects.create (first_name='John',
    last_name='Doe',
    email='john.doe@example.com',
    phone_number='1234567890',
    address='123 Main Street, City, Country')
    recipient_client = Client.objects.create (first_name='Jon',
    last_name='De',
    email='jon.doe@example.com',
    phone_number='124567890',
    address='123 Main Street, Ciy, Cuntry')
    sender_account = Account.objects.create(client_id=sender_client, account_num=1, account_type="Investment",account_balance = 20, open_date=datetime(2023,2,3),account_activity=True)
    recipient_account = Account.objects.create(client_id=recipient_client, account_num=2, account_type="Investment",account_balance = 50, open_date=datetime(2023,5,3),account_activity=True)

    data = {
        'sender_account': sender_account.account_num,
        'recipient_account': recipient_account.account_num,
        'amount': 100.0,
        'date': '2024-05-01'
    }
    response = api_client.post(url, data)
    assert response.status_code == status.HTTP_201_CREATED

    transaction = Transaction.objects.get(sender_account='sender_account')
    assert transaction.recipient_account == 'recipient_account'

@pytest.mark.django_db
def test_account_transactions(api_client, sample_transaction):
    url = reverse('account_transactions', kwargs={'account_num': sample_transaction.sender_account})
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK

@pytest.mark.django_db
def test_transaction_analytics_view(client):
    url = reverse('transaction_analytics')
    response = client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert 'type_count' in response.context
    assert 'average_amount' in response.context
    assert 'type_plot_path' in response.context
    assert 'amount_plot_path' in response.context

