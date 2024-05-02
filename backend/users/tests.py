import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from .models import User

@pytest.fixture
def authenticated_user():
    user = User.objects.create(email='test@example.com', password='testpassword')
    return user

@pytest.fixture
def api_client():
    return APIClient()

@pytest.mark.django_db
def test_register_view(api_client):
    url = reverse('reg')
    data = {
        'name': 'Test User',
        'email': 'test@example.com',
        'password': 'testpassword'
    }
    response = api_client.post(url, data)
    assert response.status_code == status.HTTP_200_OK
    assert 'id' in response.data

@pytest.mark.django_db
def test_login_view(api_client):
    url = reverse('log')
    data = {
        'email': 'test@example.com',
        'password': 'testpassword'
    }
    response = api_client.post(url, data)
    assert response.status_code == status.HTTP_200_OK
    assert 'jwt' in response.data

@pytest.mark.django_db
def test_user_view_authenticated(api_client, authenticated_user):
    url = reverse('user')
    api_client.force_authenticate(authenticated_user)
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK

@pytest.mark.django_db
def test_user_view_unauthenticated(api_client):
    url = reverse('user')
    response = api_client.get(url)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

@pytest.mark.django_db
def test_logout_view(api_client):
    url = reverse('logout')
    response = api_client.post(url)
    assert response.status_code == status.HTTP_200_OK
    assert 'jwt' not in response.cookies 

