from rest_framework import generics
from .models import Transaction
from .serializers import TransactionSerializer
from django.shortcuts import render
from .models import Transaction
from .analytics import analyze_transaction_types, average_transaction_amount, plot_transaction_types, plot_transaction_amounts, saving_plot
import os
from django.conf import settings


class TransactionListCreateAPIView(generics.ListCreateAPIView):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer

class AccountTransactionsAPIView(generics.ListAPIView):
    serializer_class = TransactionSerializer
    def get_queryset(self):
        account_num = self.kwargs['account_num']  
        return Transaction.objects.filter(sender_account__account_num=account_num) | \
               Transaction.objects.filter(recipient_account__account_num=account_num)



def transaction_analytics_view(request):
    transactions = Transaction.objects.all()
    type_count = analyze_transaction_types(transactions)
    average_amount = average_transaction_amount(transactions)
    plot_transaction_types(type_count)
    type_plot_path = os.path.join(settings.MEDIA_ROOT, 'type_plot.png')
    saving_plot(type_plot_path)
    plot_transaction_amounts(transactions)
    amount_plot_path = os.path.join(settings.MEDIA_ROOT, 'amount_plot.png')
    saving_plot(amount_plot_path)
    
    return render(request, 'analyse.html', {'type_count': type_count, 'average_amount': average_amount, 'type_plot_path': type_plot_path, 'amount_plot_path': amount_plot_path})
