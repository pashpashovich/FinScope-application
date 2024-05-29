from rest_framework import generics,status
from .models import Account, CheckingAccount, SavingsAccount, CreditAccount, SocialAccount
from .serializers import AccountSerializer,   CheckingAccountSerializer,SavingsAccountSerializer, CreditAccountSerializer, SocialAccountSerializer
from rest_framework.response import Response
from .serializers import AccountSerializer, CheckingAccountSerializer, SavingsAccountSerializer, CreditAccountSerializer, SocialAccountSerializer
from django.db.models import Value, CharField
from django.http import JsonResponse
from .models import Client, Account
from rest_framework import generics, status
from rest_framework.response import Response
from django.http import JsonResponse
from .models import Account, CheckingAccount, SavingsAccount, CreditAccount, SocialAccount, Client
from rest_framework import permissions, status
from rest_framework.views import APIView
import requests







class AccountCreateAPIView(generics.CreateAPIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()
    def get_serializer_class(self):
        account_type = self.request.data.get('account_type')
        serializer_class = {
            'checking': CheckingAccountSerializer,
            'savings': SavingsAccountSerializer,
            'credit': CreditAccountSerializer,
            'socials': SocialAccountSerializer,
        }.get(account_type, AccountSerializer)
        return serializer_class

    def create(self, request, *args, **kwargs):
        request_data = request.data.copy()  
        account_type = request_data.pop('account_type', None)  

        serializer = self.get_serializer(data=request_data)
        if serializer.is_valid():
            account = serializer.save()

            if account_type:
                account.account_type = account_type
                account.save()

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AccountRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()


class AccountListByClientIdAPIView(generics.ListAPIView): 
    serializer_class = AccountSerializer
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()
    def get_queryset(self):
        client_id = self.kwargs['client_id']
        return Account.objects.filter(client_id=client_id)

class CheckingAccountListByClientIdAPIView(generics.ListAPIView):
    serializer_class = CheckingAccountSerializer
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

    def get_queryset(self):
        client_id = self.kwargs['client_id']
        return CheckingAccount.objects.filter(client_id=client_id)

class SavingsAccountListByClientIdAPIView(generics.ListAPIView):
    serializer_class = SavingsAccountSerializer
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

    def get_queryset(self):
        client_id = self.kwargs['client_id']
        return SavingsAccount.objects.filter(client_id=client_id)

class CreditAccountListByClientIdAPIView(generics.ListAPIView):
    serializer_class = CreditAccountSerializer
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

    def get_queryset(self):
        client_id = self.kwargs['client_id']
        return CreditAccount.objects.filter(client_id=client_id)

class SocialAccountListByClientIdAPIView(generics.ListAPIView):
    serializer_class = SocialAccountSerializer
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

    def get_queryset(self):
        client_id = self.kwargs['client_id']
        return SocialAccount.objects.filter(client_id=client_id)

class CheckingAccountListAPIView(generics.ListAPIView):
    serializer_class = CheckingAccountSerializer
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

    def get_queryset(self):
        return CheckingAccount.objects.all()

class SavingsAccountListAPIView(generics.ListAPIView):
    serializer_class = SavingsAccountSerializer
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()
    def get_queryset(self):
        return SavingsAccount.objects.all()

class CreditAccountListAPIView(generics.ListAPIView):
    serializer_class = CreditAccountSerializer
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()
    def get_queryset(self):
        return CreditAccount.objects.all()

class SocialAccountListAPIView(generics.ListAPIView):
    serializer_class = SocialAccountSerializer
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

    def get_queryset(self):
        return SocialAccount.objects.all()

def clients_accounts_data(request):
    data = []
    clients = Client.objects.all()
    for client in clients:
        accounts = client.accounts.all()
        for account in accounts:
            data.append({
                'client_id': client.user.id,
                'first_name': client.first_name,
                'last_name': client.last_name,
                'income': float(client.income),
                'account_balance': float(account.account_balance),
            })
    return JsonResponse(data, safe=False)




class CheckingAccountByIdAPIView(generics.RetrieveAPIView):
    serializer_class = CheckingAccountSerializer
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()
    queryset = CheckingAccount.objects.all() 

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()  
        serializer = self.get_serializer(instance)  
        data = serializer.data
        data['account_type'] = 'Текущий счет' 
        return Response(data)

class SocialAccountByIdAPIView(generics.RetrieveAPIView):
    serializer_class = SocialAccountSerializer
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()
    queryset = SocialAccount.objects.all() 

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()  
        serializer = self.get_serializer(instance)  
        data = serializer.data
        data['account_type'] = 'Социальный счет' 
        return Response(data)

class CreditAccountByIdAPIView(generics.RetrieveAPIView):
    serializer_class = CreditAccountSerializer
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()
    queryset = CreditAccount.objects.all() 

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()  
        serializer = self.get_serializer(instance)  
        data = serializer.data
        data['account_type'] = 'Кредитный счет' 
        return Response(data)


class SavingAccountByIdAPIView(generics.RetrieveAPIView):
    serializer_class = SavingsAccountSerializer
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()
    queryset = SavingsAccount.objects.all() 

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()  
        serializer = self.get_serializer(instance)  
        data = serializer.data
        data['account_type'] = 'Сберегательный счет' 
        return Response(data)
    

class CurrencyConversionView(APIView):
    def get(self, request, account_balance, from_currency, to_currency):
        try:
            account_balance = float(account_balance)
            response = requests.get('https://www.nbrb.by/api/exrates/rates?periodicity=0')
            rates = response.json()
            rates_map = {rate['Cur_Abbreviation']: rate['Cur_OfficialRate'] for rate in rates}
            scale_map = {rate['Cur_Abbreviation']: rate['Cur_Scale'] for rate in rates}
            rates_map['BYN'] = 1.0  

            if from_currency != 'BYN':
                base_amount = account_balance * rates_map[from_currency] / scale_map[from_currency]
            else:
                base_amount = account_balance

            if to_currency != 'BYN':
                converted_amount = base_amount / rates_map[to_currency] * scale_map[to_currency]
            else:
                converted_amount = base_amount

            return Response({to_currency: converted_amount}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

