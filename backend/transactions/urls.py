from django.urls import path
from . import views

urlpatterns = [
    path('', views.TransactionListCreateAPIView.as_view(), name='transaction-list'),
    path('<int:pk>/', views.TransactionDetailAPIView.as_view(), name='transaction-detail'),
    path('analytics/', views.transaction_analytics_view, name='transaction-analytics'),
]