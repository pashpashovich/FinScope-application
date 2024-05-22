from django.urls import path
from . import views

urlpatterns = [
    path('', views.TransactionListCreateAPIView.as_view(), name='transaction-list'),
    path('<int:account_num>/', views.AccountTransactionsAPIView.as_view(), name='account_transactions'),
    path('date-range/', views.TransactionsByDateRangeAPIView.as_view(), name='transaction-by-date-range'),
    path('generate-pdf/', views.generate_pdf, name='generate_pdf'),

]