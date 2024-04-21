from rest_framework import generics
from .models import Account
from .serializers import AccountSerializer


class AccountCreateAPIView(generics.ListCreateAPIView):
    queryset=Account.objects.all()
    serializer_class=AccountSerializer

class AccountRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
