from rest_framework import generics,status
from .models import Client
from .serializers import ClientSerializer
from .models import BankDirector, FinancialAnalyst
from .serializers import BankDirectorSerializer, FinancialAnalystSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from users.models import User
from .serializers import UserSerializer

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

@api_view(['POST'])
def upload_avatar(request, user_id):
    user = User.objects.get(id=user_id)
    data = {'avatar': request.data.get('avatar')}
    serializer = UserSerializer(user, data=data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
