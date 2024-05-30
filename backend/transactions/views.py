from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status,generics
from .models import Transaction
from .serializers import TransactionSerializer
from django.utils.dateparse import parse_datetime
import pytz
from django.http import HttpResponse
from reportlab.lib.pagesizes import letter
from .models import Transaction
import matplotlib.pyplot as plt
from io import BytesIO
import base64
from .models import Transaction
from .serializers import TransactionSerializer
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from datetime import datetime
import matplotlib
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Image
from django.utils.dateparse import parse_datetime
from django.http import HttpResponse, JsonResponse
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from io import BytesIO
from datetime import datetime
import pytz
import requests
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg') 
from rest_framework import permissions, status
from reportlab.pdfbase import pdfmetrics
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from .models import Transaction, Receipt
from django.core.files.base import ContentFile
from io import BytesIO
from reportlab.pdfbase.ttfonts import TTFont
import io
from django.shortcuts import get_object_or_404
from django.utils.dateparse import parse_date
import numpy as np
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Max, Min, Avg, Sum, Q
from .models import Transaction
import calendar
from datetime import datetime

class AccountTransactionStats(APIView):
    permission_classes = [AllowAny]
    authentication_classes = ()

    def get(self, request, account_num, month):
        year = datetime.now().year
        last_day = calendar.monthrange(year, int(month))[1]
        start_date = datetime(year, int(month), 1)
        end_date = datetime(year, int(month), last_day)

        transactions = Transaction.objects.filter(
            transaction_time__date__range=(start_date, end_date),
            sender_account__account_num=account_num
        )

        agg_stats = transactions.aggregate(
            Max('amount'), Min('amount'), Avg('amount')
        )

        deposit_sum = transactions.filter(
            Q(transaction_type='deposit') | Q(transaction_type='transfer', recipient_account__account_num=account_num)
        ).aggregate(total_deposit=Sum('amount'))

        withdrawal_sum = transactions.filter(
            Q(transaction_type='withdrawal') | Q(transaction_type='transfer', sender_account__account_num=account_num)
        ).aggregate(total_withdrawal=Sum('amount'))

        response_data = {
            'max_transaction': agg_stats['amount__max'],
            'min_transaction': agg_stats['amount__min'],
            'avg_transaction': agg_stats['amount__avg'],
            'total_deposits': deposit_sum['total_deposit'],
            'total_withdrawals': withdrawal_sum['total_withdrawal']
        }

        return Response(response_data)




class TransactionsByDateRangeAPIView(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()
    def get(self, request, *args, **kwargs):
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')
        if start_date:
            start_date = parse_datetime(start_date).astimezone(pytz.UTC)
        if end_date:
            end_date = parse_datetime(end_date).astimezone(pytz.UTC)

        transactions = Transaction.objects.filter(transaction_time__range=[start_date, end_date])
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class TransactionListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()
    serializer_class = TransactionSerializer

    def get_queryset(self):
        queryset = Transaction.objects.all()
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')

        if start_date:
            start_date = parse_date(start_date)
            queryset = queryset.filter(transaction_time__date__gte=start_date)
        if end_date:
            end_date = parse_date(end_date)
            queryset = queryset.filter(transaction_time__date__lte=end_date)
            
        return queryset
    
    

class AccountTransactionsAPIView(generics.ListAPIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()
    serializer_class = TransactionSerializer
    def get_queryset(self):
        account_num = self.kwargs['account_num']  
        return Transaction.objects.filter(sender_account__account_num=account_num) | \
               Transaction.objects.filter(recipient_account__account_num=account_num)



def generate_pdf(request):
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    
    transactions = Transaction.objects.all()

    if start_date:
        start_date = parse_date(start_date)
        transactions = transactions.filter(transaction_time__date__gte=start_date)
    if end_date:
        end_date = parse_date(end_date)
        transactions = transactions.filter(transaction_time__date__lte=end_date)
    
    dates, counts = generate_chart_data(transactions)

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    elements = []

    elements.append(Paragraph("Transaction Report", getSampleStyleSheet()['Title']))
    elements.append(Paragraph(f"Report Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", getSampleStyleSheet()['Normal']))

    data = [["ID", "Sender Account", "Recipient Account", "Amount", "Date", "Type"]]
    for transaction in transactions:
        data.append([
            transaction.id,
            str(transaction.sender_account),
            str(transaction.recipient_account),
            transaction.amount,
            transaction.transaction_time.strftime("%Y-%m-%d %H:%M:%S"),
            transaction.transaction_type
        ])
    table = Table(data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.red),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    elements.append(table)
    elements.append(Paragraph("<br/>"))  
    
    plt.figure(figsize=(10, 5))
    plt.plot(dates, counts, marker='o')
    plt.title('Transactions by Date')
    plt.xlabel('Date')
    plt.ylabel('Transaction Count')
    plt.grid(True)

    buf = BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight')
    buf.seek(0)
    plt.close()

    chart_image = Image(buf)
    chart_image.drawHeight = 400
    chart_image.drawWidth = 360

    elements.append(chart_image)

    doc.build(elements)

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="transactions_report.pdf"'
    response.write(buffer.getvalue())
    buffer.close()
    return response

def generate_chart_data(transactions):
    counts = {}
    for transaction in transactions:
        date = transaction.transaction_time.date()
        if date not in counts:
            counts[date] = 0
        counts[date] += 1

    sorted_dates = sorted(counts.keys())
    sorted_counts = [counts[date] for date in sorted_dates]
    return sorted_dates, sorted_counts



class TransactionReceiptView(APIView):
    def get(self, request, transaction_id):
        transaction = get_object_or_404(Transaction, id=transaction_id)
        
        buffer = io.BytesIO()
        p = canvas.Canvas(buffer)

        pdfmetrics.registerFont(TTFont('DejaVuSerif', 'D:/DRF/backend/transactions/DejaVuSerif.ttf','UTF-8'))

        p.setFont("DejaVuSerif", 12)

        p.drawString(100, 800, f"Transaction Report")
        p.drawString(100, 780, f"Transaction ID: {transaction.id}")
        p.drawString(100, 760, f"Sender Account: {transaction.sender_account.account_num if transaction.sender_account else 'N/A'}")
        p.drawString(100, 740, f"Receiver Account: {transaction.recipient_account.account_num if transaction.recipient_account else 'N/A'}")
        p.drawString(100, 720, f"Sum: {transaction.amount} {transaction.currency}")
        p.drawString(100, 700, f"Transaction type: {transaction.transaction_type}")
        p.drawString(100, 680, f"Transaction time: {transaction.formatted_time()}")

        p.showPage()
        p.save()

        buffer.seek(0)
        return HttpResponse(buffer, content_type='application/pdf')

class ListReceiptsView(APIView):
    def get(self, request):
        receipts = Receipt.objects.all()
        data = [{'transaction_id': receipt.transaction.id, 'pdf_file': receipt.pdf_file.url} for receipt in receipts]
        return Response(data, status=status.HTTP_200_OK)



def boxplot_data(request):
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    transaction_type = request.GET.get('transaction_type')

    transactions = Transaction.objects.filter(transaction_time__date__gte=start_date, transaction_time__date__lte=end_date, transaction_type=transaction_type)

    data = {}
    for transaction in transactions:
        transaction_date = str(transaction.transaction_time.date())
        if transaction_date not in data:
            data[transaction_date] = []
        data[transaction_date].append(float(transaction.amount))

    boxplot_data = {
        'labels': sorted(data.keys()),
        'datasets': [{
            'label': 'Transaction Amounts',
            'data': [np.percentile(data[date], [0, 25, 50, 75, 100]).tolist() for date in sorted(data)]
        }]
    }

    return JsonResponse(boxplot_data)






