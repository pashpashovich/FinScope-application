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
from django.http import HttpResponse
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
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()
    
    

class AccountTransactionsAPIView(generics.ListAPIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()
    serializer_class = TransactionSerializer
    def get_queryset(self):
        account_num = self.kwargs['account_num']  
        return Transaction.objects.filter(sender_account__account_num=account_num) | \
               Transaction.objects.filter(recipient_account__account_num=account_num)



def generate_pdf(request):
    transactions = Transaction.objects.all()

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
    chart_image.drawHeight=400
    chart_image.drawWidth=360

    elements.append(chart_image)


    doc.build(elements)

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="transactions_report.pdf"'
    response.write(buffer.getvalue())
    buffer.close()
    print(get_exchange_rate_by_code(431))
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


def get_exchange_rate_by_code(currency_code):
    url = f"https://api.nbrb.by/exrates/rates/{currency_code}"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        return data['Cur_OfficialRate'] / data['Cur_Scale']
    else:
        raise ValueError(f"Unable to fetch exchange rate for {currency_code}")


