from django.shortcuts import render
from django.views.generic import TemplateView
from rest_framework.response import Response
from rest_framework.decorators import api_view
import matplotlib.pyplot as plt
import os
from django.conf import settings
from transactions.models import Transaction
from transactions.serializers import TransactionSerializer

class HomePageView(TemplateView):
    template_name = 'main.html'

class LoginPageView(TemplateView):
    template_name = 'auth.html'

class ProfilePageView(TemplateView):
    template_name = 'profile.html'


class  DataPageView(TemplateView):
    template_name = 'data.html'

class  AnalysePageView(TemplateView):
    template_name = 'analyse.html'




@api_view(['GET'])
def transaction_analytics_view(request):
    transactions = Transaction.objects.all()
    type_count = analyze_transaction_types(transactions)
    average_amount = average_transaction_amount(transactions)
    
    type_plot_path = os.path.join(settings.MEDIA_ROOT, 'type_plot.png')
    plot_transaction_types(type_count, type_plot_path)
    
    amount_plot_path = os.path.join(settings.MEDIA_ROOT, 'amount_plot.png')
    plot_transaction_amounts(transactions, amount_plot_path)
    
    return Response({
        'type_count': type_count,
        'average_amount': average_amount,
        'type_plot_path': type_plot_path,
        'amount_plot_path': amount_plot_path
    })

def analyze_transaction_types(transactions):
    types = {transaction.transaction_type for transaction in transactions}
    type_count = {t: sum(1 for tr in transactions if tr.transaction_type == t) for t in types}
    return type_count

def average_transaction_amount(transactions):
    total_amount = sum(transaction.amount for transaction in transactions)
    average = total_amount / len(transactions) if transactions else 0
    return average

def plot_transaction_types(type_count, plot_path):
    plt.figure()
    plt.bar(type_count.keys(), type_count.values())
    plt.xlabel('Transaction Type')
    plt.ylabel('Count')
    plt.title('Transaction Type Distribution')
    plt.savefig(plot_path)
    plt.close()

def plot_transaction_amounts(transactions, plot_path):
    plt.figure()
    amounts = [transaction.amount for transaction in transactions]
    plt.hist(amounts, bins=20, color='blue', alpha=0.7)
    plt.xlabel('Transaction Amount')
    plt.ylabel('Frequency')
    plt.title('Transaction Amount Distribution')
    plt.savefig(plot_path)
    plt.close()