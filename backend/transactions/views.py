from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics, serializers
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.utils.dateparse import parse_datetime, parse_date
from django.http import HttpResponse, JsonResponse
from django.core.files.base import ContentFile
from django.shortcuts import get_object_or_404
from django.db.models import Max, Min, Avg, Sum, Q
from collections import defaultdict
from datetime import datetime
from decimal import Decimal
import calendar
import pytz
import numpy as np
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Image
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from .models import Transaction, Receipt,Account
from .serializers import TransactionSerializer
from rest_framework.decorators import api_view, permission_classes
from .api import get_сonvert
from clients.permissions import IsAnalyst,IsClient,IsDirector
import io
from django.db.models import Count
from datetime import timedelta
from django.utils.timezone import make_aware
from accounts.models import CheckingAccount, SavingsAccount, CreditAccount, SocialAccount
from .serializers import TransactionSerializer


class AllClientsTransactionStats(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')

        if not start_date or not end_date:
            return Response({'error': 'Start date and end date are required'}, status=400)

        transactions = Transaction.objects.filter(
            transaction_time__date__range=(start_date, end_date)
        )

        max_transaction = 0
        min_transaction = float('inf')
        total_amount = Decimal(0)
        total_deposits = Decimal(0)
        total_withdrawals = Decimal(0)
        count = 0

        for transaction in transactions:
            amount_in_byn = transaction.convert_amount_to(transaction.amount, transaction.currency,"BYN")

            if amount_in_byn > max_transaction:
                max_transaction = amount_in_byn
            if amount_in_byn < min_transaction:
                min_transaction = amount_in_byn
            total_amount += amount_in_byn
            count += 1
            
            if transaction.transaction_type in ['deposit', 'transfer'] and transaction.recipient_account:
                total_deposits += amount_in_byn
            if transaction.transaction_type in ['withdrawal', 'transfer'] and transaction.sender_account:
                total_withdrawals += amount_in_byn

        avg_transaction = total_amount / count if count else 0

        response_data = {
            'max_transaction': max_transaction,
            'min_transaction': min_transaction,
            'avg_transaction': avg_transaction,
            'total_deposits': total_deposits,
            'total_withdrawals': total_withdrawals
        }

        return Response(response_data)




class AccountDailyTransactionStats(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, account_num, month):
        year = datetime.now().year
        last_day = calendar.monthrange(year, month)[1]
        start_date = datetime(year, month, 1)
        end_date = datetime(year, month, last_day)

        transactions = Transaction.objects.filter(
            Q(transaction_time__date__range=(start_date, end_date)) &
            (Q(sender_account__account_num=account_num) | Q(recipient_account__account_num=account_num))
        )

        daily_stats = defaultdict(lambda: {'deposits': 0, 'withdrawals': 0})

        for transaction in transactions:
            day = transaction.transaction_time.day
            amount_in_byn = transaction.convert_amount_to(transaction.amount, transaction.currency, 'BYN')

            if transaction.transaction_type in ['deposit', 'transfer'] and transaction.recipient_account.account_num == account_num:
                daily_stats[day]['deposits'] += amount_in_byn
            if transaction.transaction_type in ['withdrawal', 'transfer'] and transaction.sender_account.account_num == account_num:
                daily_stats[day]['withdrawals'] += amount_in_byn

        response_data = [{'day': day, 'deposits': stats['deposits'], 'withdrawals': stats['withdrawals']} for day, stats in daily_stats.items()]

        return Response(response_data)


class AccountTransactionStats(APIView):
    permission_classes = [IsAuthenticated]


    def convert_to_byn(self, transaction):
    
        return get_сonvert(transaction.amount,transaction.currency,'BYN')

    def get(self, request, account_num, month):
        year = datetime.now().year
        last_day = calendar.monthrange(year, int(month))[1]
        start_date = datetime(year, int(month), 1)
        end_date = datetime(year, int(month), last_day)

        transactions = Transaction.objects.filter(
            Q(transaction_time__date__range=(start_date, end_date)) & 
            (Q(sender_account__account_num=account_num) | Q(recipient_account__account_num=account_num))
        )

        transactions_in_byn = [
            self.convert_to_byn(transaction) for transaction in transactions
        ]

        max_transaction = max(transactions_in_byn) if transactions_in_byn else 0
        min_transaction = min(transactions_in_byn) if transactions_in_byn else 0
        avg_transaction = sum(transactions_in_byn) / len(transactions_in_byn) if transactions_in_byn else 0


        deposit_transactions = transactions.filter(
            Q(transaction_type='deposit') | Q(transaction_type='transfer', recipient_account__account_num=account_num)
        )
        total_deposit_in_byn = sum(self.convert_to_byn(transaction) for transaction in deposit_transactions)


        withdrawal_transactions = transactions.filter(
            Q(transaction_type='withdrawal') | Q(transaction_type='transfer', sender_account__account_num=account_num)
        )
        total_withdrawal_in_byn = sum(self.convert_to_byn(transaction) for transaction in withdrawal_transactions)

        response_data = {
            'max_transaction': max_transaction,
            'min_transaction': min_transaction,
            'avg_transaction': avg_transaction,
            'total_deposits': total_deposit_in_byn,
            'total_withdrawals': total_withdrawal_in_byn
        }

        return Response(response_data)




class TransactionsByDateRangeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')
        if start_date:
            start_date = parse_datetime(start_date).astimezone(pytz.UTC)
        if end_date:
            end_date = parse_datetime(end_date).astimezone(pytz.UTC)
        
        end_date += timedelta(days=1)


        transactions = Transaction.objects.filter(transaction_time__range=[start_date, end_date])
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)



class TransactionListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
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

    def perform_create(self, serializer):
        sender_account = serializer.validated_data.get('sender_account')
        amount = serializer.validated_data.get('amount')
        transaction_type = serializer.validated_data.get('transaction_type')

        if transaction_type in ['withdrawal', 'transfer']:
            account = self.get_account_type(sender_account)
            available_balance = account.account_balance

            if isinstance(account, CheckingAccount):
                available_balance += account.overdraft_limit
                if amount > available_balance:
                    raise serializers.ValidationError({'error': 'Недостаточно средств для выполнения операции.'})
            elif isinstance(account, CreditAccount):
                available_balance += account.credit_limit
                if amount > available_balance:
                    raise serializers.ValidationError({'error': 'Недостаточно средств для выполнения операции.'})
            else:
                if amount > available_balance:
                    raise serializers.ValidationError({'error': 'Недостаточно средств для выполнения операции.'})

        serializer.save()

    def get_account_type(self, account):
        try:
            return CheckingAccount.objects.get(pk=account.pk)
        except CheckingAccount.DoesNotExist:
            pass

        try:
            return SavingsAccount.objects.get(pk=account.pk)
        except SavingsAccount.DoesNotExist:
            pass

        try:
            return CreditAccount.objects.get(pk=account.pk)
        except CreditAccount.DoesNotExist:
            pass

        try:
            return SocialAccount.objects.get(pk=account.pk)
        except SocialAccount.DoesNotExist:
            pass

        raise ValueError('Unknown account type')

class AccountTransactionsAPIView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TransactionSerializer

    def get_queryset(self):
        account_num = self.kwargs['account_num']  
        return Transaction.objects.filter(sender_account__account_num=account_num) | \
               Transaction.objects.filter(recipient_account__account_num=account_num)

    def get_account_type(self, account):
        try:
            return CheckingAccount.objects.get(pk=account.pk)
        except CheckingAccount.DoesNotExist:
            pass

        try:
            return SavingsAccount.objects.get(pk=account.pk)
        except SavingsAccount.DoesNotExist:
            pass

        try:
            return CreditAccount.objects.get(pk=account.pk)
        except CreditAccount.DoesNotExist:
            pass

        try:
            return SocialAccount.objects.get(pk=account.pk)
        except SocialAccount.DoesNotExist:
            pass

        raise ValueError('Unknown account type')

    
    


@permission_classes([IsAuthenticated,IsAnalyst])
def generate_pdf(request):
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    first_name = request.GET.get('first_name')
    last_name = request.GET.get('last_name')

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
    elements.append(Paragraph("<br/>"))  
    elements.append(Paragraph(f"Report Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", getSampleStyleSheet()['Normal']))
    elements.append(Paragraph("<br/>"))  
    elements.append(Paragraph(f"Generated by: {first_name} {last_name}", getSampleStyleSheet()['Normal']))
    elements.append(Paragraph("<br/>"))  
    elements.append(Paragraph(f"Period: {start_date}-{end_date}", getSampleStyleSheet()['Normal']))
    elements.append(Paragraph("<br/>"))  

    max_transaction = 0
    min_transaction = float('inf')
    total_amount = Decimal(0)
    total_deposits = Decimal(0)
    total_withdrawals = Decimal(0)
    count = 0

    for transaction in transactions:
        amount_in_byn = transaction.convert_amount_to(transaction.amount, transaction.currency,"BYN")

        if amount_in_byn > max_transaction:
            max_transaction = amount_in_byn
        if amount_in_byn < min_transaction:
            min_transaction = amount_in_byn
        total_amount += amount_in_byn
        count += 1
        
        if transaction.transaction_type in ['deposit', 'transfer'] and transaction.recipient_account:
            total_deposits += amount_in_byn
        if transaction.transaction_type in ['withdrawal', 'transfer'] and transaction.sender_account:
            total_withdrawals += amount_in_byn

    elements.append(Paragraph(f"Max transaction: {max_transaction} BYN", getSampleStyleSheet()['Normal']))
    elements.append(Paragraph("<br/>"))  
    elements.append(Paragraph(f"Min transaction: {min_transaction} BYN", getSampleStyleSheet()['Normal']))
    elements.append(Paragraph("<br/>"))  
    elements.append(Paragraph(f"Total sum of transactions: {total_amount} BYN", getSampleStyleSheet()['Normal']))
    elements.append(Paragraph("<br/>"))  
    elements.append(Paragraph(f"Total sum of deposits: {total_deposits} BYN", getSampleStyleSheet()['Normal']))
    elements.append(Paragraph("<br/>"))  
    elements.append(Paragraph(f"Total sum of withdrawals: {total_withdrawals} BYN", getSampleStyleSheet()['Normal']))
    elements.append(Paragraph("<br/>"))  
    elements.append(Paragraph(f"Total count of transactions: {count}", getSampleStyleSheet()['Normal']))
    elements.append(Paragraph("<br/>"))  


    data = [["ID","Amount", "Currency","Date", "Type"]]
    for transaction in transactions:
        data.append([
            transaction.id,
            transaction.amount,
            transaction.currency,
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

@api_view(['GET'])
@permission_classes([IsAuthenticated,IsClient])
def generate_pdf_client(request):
    account_num = request.GET.get('account')
    month = request.GET.get('month')

    try:
        account = Account.objects.get(account_num=account_num)
    except Account.DoesNotExist:
        return HttpResponse("Account not found", status=404)
    
    transactions = Transaction.objects.filter(
        sender_account=account, transaction_time__month=month
    ) | Transaction.objects.filter(
        recipient_account=account, transaction_time__month=month
    )

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    elements = []

    elements.append(Paragraph("Transaction Report", getSampleStyleSheet()['Title']))
    elements.append(Paragraph("<br/>"))  
    elements.append(Paragraph(f"Date of report: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", getSampleStyleSheet()['Normal']))
    elements.append(Paragraph("<br/>"))  
    elements.append(Paragraph(f"Account num: {account_num}", getSampleStyleSheet()['Normal']))
    elements.append(Paragraph("<br/>"))  
    elements.append(Paragraph(f"Month: {month}", getSampleStyleSheet()['Normal']))
    elements.append(Paragraph("<br/>"))  

    max_transaction = 0
    min_transaction = float('inf')
    total_amount = 0
    total_deposits = 0
    total_withdrawals = 0
    count = 0

    for transaction in transactions:
        amount_in_byn = transaction.convert_amount_to(transaction.amount, transaction.currency, "BYN")

        if amount_in_byn > max_transaction:
            max_transaction = amount_in_byn
        if amount_in_byn < min_transaction:
            min_transaction = amount_in_byn
        total_amount += amount_in_byn
        count += 1
        
        if transaction.transaction_type in ['deposit', 'transfer'] and transaction.recipient_account:
            total_deposits += amount_in_byn
        if transaction.transaction_type in ['withdrawal', 'transfer'] and transaction.sender_account:
            total_withdrawals += amount_in_byn

    elements.append(Paragraph(f"Max transaction: {max_transaction} BYN", getSampleStyleSheet()['Normal']))
    elements.append(Paragraph("<br/>"))  
    elements.append(Paragraph(f"Min transaction: {min_transaction} BYN", getSampleStyleSheet()['Normal']))
    elements.append(Paragraph("<br/>"))  
    elements.append(Paragraph(f"Total sum of transactions: {total_amount} BYN", getSampleStyleSheet()['Normal']))
    elements.append(Paragraph("<br/>"))  
    elements.append(Paragraph(f"Total sum of incomes: {total_deposits} BYN", getSampleStyleSheet()['Normal']))
    elements.append(Paragraph("<br/>"))  
    elements.append(Paragraph(f"Total sum of outcomes: {total_withdrawals} BYN", getSampleStyleSheet()['Normal']))
    elements.append(Paragraph("<br/>"))  
    elements.append(Paragraph(f"Total count of transactions: {count}", getSampleStyleSheet()['Normal']))
    elements.append(Paragraph("<br/>"))  

    data = [["ID","Sum", "Currency","Date", "Type"]]
    for transaction in transactions:
        data.append([
            transaction.id,
            transaction.amount,
            transaction.currency,
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

    doc.build(elements)

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="user_report_{account_num}_{month}.pdf"'
    response.write(buffer.getvalue())
    buffer.close()
    return response







@permission_classes([IsAuthenticated])
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
    permission_classes = [IsAuthenticated]

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

class MaxTransactionsPerDay(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')

        if not start_date_str or not end_date_str:
            return Response({'error': 'Both start_date and end_date are required'}, status=status.HTTP_400_BAD_REQUEST)

        start_date = make_aware(parse_datetime(start_date_str), pytz.UTC)
        end_date = make_aware(parse_datetime(end_date_str), pytz.UTC)

        if not start_date or not end_date:
            return Response({'error': 'Invalid date format'}, status=status.HTTP_400_BAD_REQUEST)
        


        transactions = Transaction.objects.filter(transaction_time__date__range=(start_date, end_date))

        def convert_to_byn(transaction):
            amount_in_byn = Decimal(get_сonvert(transaction.amount, transaction.currency, 'BYN')).quantize(Decimal('0.01'))
            return {'date': transaction.transaction_time.date(), 'amount': amount_in_byn}

        transfers = [convert_to_byn(t) for t in transactions.filter(transaction_type='transfer')]
        withdrawals = [convert_to_byn(t) for t in transactions.filter(transaction_type='withdrawal')]
        deposits = [convert_to_byn(t) for t in transactions.filter(transaction_type='deposit')]

        max_transfers = {}
        max_withdrawals = {}
        max_deposits = {}

        for transfer in transfers:
            date = transfer['date']
            amount = transfer['amount']
            if date not in max_transfers or amount > max_transfers[date]:
                max_transfers[date] = amount

        for withdrawal in withdrawals:
            date = withdrawal['date']
            amount = withdrawal['amount']
            if date not in max_withdrawals or amount > max_withdrawals[date]:
                max_withdrawals[date] = amount

        for deposit in deposits:
            date = deposit['date']
            amount = deposit['amount']
            if date not in max_deposits or amount > max_deposits[date]:
                max_deposits[date] = amount

        dates = sorted(set(max_transfers.keys()) | set(max_withdrawals.keys()) | set(max_deposits.keys()))

        data = {
            'dates': dates,
            'max_transfers': [max_transfers.get(date, 0) for date in dates],
            'max_withdrawals': [max_withdrawals.get(date, 0) for date in dates],
            'max_deposits': [max_deposits.get(date, 0) for date in dates],
        }

        return Response(data, status=status.HTTP_200_OK)

class TransactionCountByType(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if not start_date or not end_date:
            return Response({'error': 'Both start_date and end_date are required'}, status=status.HTTP_400_BAD_REQUEST)

        start_date = parse_date(start_date)
        end_date = parse_date(end_date)

        if not start_date or not end_date:
            return Response({'error': 'Invalid date format'}, status=status.HTTP_400_BAD_REQUEST)

        transactions = Transaction.objects.filter(transaction_time__date__range=(start_date, end_date))
        counts = transactions.values('transaction_type').annotate(count=Count('transaction_type'))
        data = {item['transaction_type']: item['count'] for item in counts}
        return Response(data, status=status.HTTP_200_OK)






