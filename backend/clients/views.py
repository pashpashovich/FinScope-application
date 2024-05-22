from rest_framework import generics
from .models import Client
from .serializers import ClientSerializer
from .models import BankDirector, FinancialAnalyst
from .serializers import BankDirectorSerializer, FinancialAnalystSerializer

class ClientListCreateAPIView(generics.ListCreateAPIView):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer

class ClientRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer



class BankDirectorRetrieveUpdateAPIView(generics.RetrieveUpdateAPIView):
    queryset = BankDirector.objects.all()
    serializer_class = BankDirectorSerializer

class FinancialAnalystRetrieveUpdateAPIView(generics.RetrieveUpdateAPIView):
    queryset = FinancialAnalyst.objects.all()
    serializer_class = FinancialAnalystSerializer
