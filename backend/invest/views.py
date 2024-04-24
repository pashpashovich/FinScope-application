from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import CreditAccount
from .serializers import CreditAccountSerializer
from .models import InvestmentPortfolio
from .serializers import InvestmentPortfolioSerializer

class CreditAccountListView(APIView):
    def get(self, request):
        accounts = CreditAccount.objects.all()
        serializer = CreditAccountSerializer(accounts, many=True)
        return Response({"accounts": serializer.data}, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = CreditAccountSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class InvestmentPortfolioListView(APIView):
    def get(self, request):
        portfolios = InvestmentPortfolio.objects.all()
        serializer = InvestmentPortfolioSerializer(portfolios, many=True)
        return Response({"portfolios": serializer.data}, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = InvestmentPortfolioSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)