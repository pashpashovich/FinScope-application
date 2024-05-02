import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from .models import Account, Client
from datetime import datetime

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def create_client():
    return Client.objects.create(first_name='John', last_name='Doe', email='john@example.com',phone_number='1',address='1',date_created=datetime(2024,5,2))

@pytest.fixture
def create_account(create_client):
    return Account.objects.create(client_id=1, account_number='123456', balance=1000,account_type='Investment',open_date=datetime(2024,5,2),account_activity=True)

@pytest.mark.django_db
def test_create_account(api_client, create_client):
    url = reverse('account-list')
    data = {
        'client_id': 2,
        'account_number': '654321',
        'balance': 2000,
        'account_type':'Investment',

    }

    response = api_client.post(url, data, format='json')
    assert response.status_code == status.HTTP_201_CREATED

@pytest.mark.django_db
def test_retrieve_update_destroy_account(api_client, create_account):
    url = reverse('account-detail', kwargs={'pk': create_account.pk})
    updated_data = {
        'balance': 3000
    }

    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK

    response = api_client.put(url, updated_data, format='json')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['balance'] == updated_data['balance']

    response = api_client.delete(url)
    assert response.status_code == status.HTTP_204_NO_CONTENT

@pytest.mark.django_db
def test_list_accounts_by_client_id(api_client, create_account):
    url = reverse('account-list-by-client', kwargs={'client_id': create_account.client_id})
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK

