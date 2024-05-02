import pytest
from django.urls import reverse
from rest_framework import status
from .models import Client
from .serializers import ClientSerializer
from rest_framework.test import APIClient

@pytest.mark.django_db
def test_create_client():
    client_data = {
        'first_name': 'John',
        'last_name': 'Doe',
        'email': 'john@example.com',
        'phone_number': '123456789',
        'address': '123 Main Street'
    }

    client_count_before = Client.objects.count()

    url = reverse('client-list')
    response = APIClient().post(url, client_data, format='json')

    assert response.status_code == status.HTTP_201_CREATED
    assert Client.objects.count() == client_count_before + 1

    created_client = Client.objects.last()
    assert created_client.first_name == client_data['first_name']
    assert created_client.last_name == client_data['last_name']
    assert created_client.email == client_data['email']
    assert created_client.phone_number == client_data['phone_number']
    assert created_client.address == client_data['address']

@pytest.mark.django_db
def test_retrieve_client():
    client = Client.objects.create(
        first_name='John',
        last_name='Doe',
        email='john@example.com',
        phone_number='123456789',
        address='123 Main Street'
    )

    url = reverse('client-detail', kwargs={'pk': client.pk})
    response = APIClient().get(url)

    assert response.status_code == status.HTTP_200_OK
    assert response.data['first_name'] == client.first_name
    assert response.data['last_name'] == client.last_name
    assert response.data['email'] == client.email
    assert response.data['phone_number'] == client.phone_number
    assert response.data['address'] == client.address

@pytest.mark.django_db
def test_update_client():
    client = Client.objects.create(
        first_name='John',
        last_name='Doe',
        email='john@example.com',
        phone_number='123456789',
        address='123 Main Street'
    )

    url = reverse('client-detail', kwargs={'pk': client.pk})
    updated_client_data = {
        'first_name': 'Updated John',
        'last_name': 'Updated Doe',
        'email': 'updated_john@example.com',
        'phone_number': '987654321',
        'address': '456 Oak Street'
    }

    response = APIClient().put(url, updated_client_data, format='json')

    assert response.status_code == status.HTTP_200_OK
    client.refresh_from_db()
    assert client.first_name == updated_client_data['first_name']
    assert client.last_name == updated_client_data['last_name']
    assert client.email == updated_client_data['email']
    assert client.phone_number == updated_client_data['phone_number']
    assert client.address == updated_client_data['address']

@pytest.mark.django_db
def test_delete_client():
    client = Client.objects.create(
        first_name='John',
        last_name='Doe',
        email='john@example.com',
        phone_number='123456789',
        address='123 Main Street'
    )

    url = reverse('client-detail', kwargs={'pk': client.pk})
    response = APIClient().delete(url)

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert not Client.objects.filter(pk=client.pk).exists()

