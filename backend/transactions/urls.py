from django.urls import path
from . import views

urlpatterns = [
    path('', views.TransactionListCreateAPIView.as_view(), name='transaction-list'),
    path('<int:account_num>/', views.AccountTransactionsAPIView.as_view(), name='account_transactions'),
    path('date-range/', views.TransactionsByDateRangeAPIView.as_view(), name='transaction-by-date-range'),
    path('generate-pdf/', views.generate_pdf, name='generate_pdf'),
    path('receipt/<int:transaction_id>/', views.TransactionReceiptView.as_view(), name='transaction-receipt'),
    path('receipts/', views.ListReceiptsView.as_view(), name='list-receipts'),
    path('boxplot/', views.boxplot_data, name='boxplot_data'),
    path('<str:account_num>/<int:month>/stats/', views.AccountTransactionStats.as_view(), name='account-transaction-stats'),
    path('<int:account_num>/<int:month>/daily/', views.AccountDailyTransactionStats.as_view(), name='account-daily-transaction-stats'),
    path('stats/', views.AllClientsTransactionStats.as_view(), name='all-clients-transaction-stats'),
    path('max-per-day/', views.MaxTransactionsPerDay.as_view(), name='max-transactions-per-day'),
    path('count-by-type/', views.TransactionCountByType.as_view(), name='count-by-type'),

]