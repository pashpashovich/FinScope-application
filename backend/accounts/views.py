from rest_framework import generics


from .models import Account
from .serializers import AccountSerializer


class AccountListAPIView(generics.ListAPIView):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer

class AccountCreateAPIView(generics.CreateAPIView):
    queryset=Account.objects.all()
    serializer_class=AccountSerializer

account_create_view = AccountCreateAPIView.as_view()


class AccountDetailAPIView(generics.RetrieveAPIView):
    queryset=Account.objects.all()
    serializer_class=AccountSerializer



account_detail_view = AccountDetailAPIView.as_view()

