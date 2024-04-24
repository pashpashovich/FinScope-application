from django.shortcuts import render
from django.views.generic import TemplateView
from rest_framework.response import Response
from rest_framework.decorators import api_view
import matplotlib.pyplot as plt
import os
from django.conf import settings
from transactions.models import Transaction
from transactions.serializers import TransactionSerializer
from rest_framework import generics
from rest_framework.response import Response
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle

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



class ReportAPIView(generics.ListAPIView):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer

    def get(self, request, *args, **kwargs):
        transactions = self.get_queryset()
        total_transactions = transactions.count()
        average_amount = sum(transaction.amount for transaction in transactions) / total_transactions if total_transactions > 0 else 0
        report_data = {
            'total_transactions': total_transactions,
            'average_amount': average_amount,
        }
        pdf_filename = "report.pdf"
        pdf_path = f"{settings.MEDIA_ROOT}/{pdf_filename}"
        pdf = SimpleDocTemplate(pdf_path, pagesize=letter)
        elements = []
        data = [["Total Transactions", "Average Amount"],
                [report_data['total_transactions'], report_data['average_amount']]]
        
        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))

        elements.append(table)
        pdf.build(elements)
        return Response({'pdf_path': pdf_path})