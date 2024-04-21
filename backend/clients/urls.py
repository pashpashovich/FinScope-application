from django.urls import path
from . import views

urlpatterns = [
    path('', views.ClientListCreateAPIView.as_view(), name='client-list'),
    path('<int:pk>/', views.ClientRetrieveUpdateDestroyAPIView.as_view(), name='client-detail'),
] 

