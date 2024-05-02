from rest_framework import generics
from .models import Account
from .serializers import AccountSerializer


class AccountCreateAPIView(generics.ListCreateAPIView):
    queryset=Account.objects.all()
    serializer_class=AccountSerializer

class AccountRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer

class AccountListByClientIdAPIView(generics.ListAPIView):
    serializer_class = AccountSerializer
    def get_queryset(self):
        client_id = self.kwargs['client_id']
        queryset = Account.objects.filter(client_id=client_id)
        return queryset
