from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from .models import Client, BankDirector, FinancialAnalyst
from .serializers import ClientSerializer, BankDirectorSerializer, FinancialAnalystSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from users.models import User
from users.serializers import UserSerializer
from .permissions import IsAnalyst,IsDirector, IsClient
from logging import Logger
from rest_framework import permissions, status
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser



class ClientListCreateAPIView(generics.ListCreateAPIView):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated,IsAnalyst]

class ClientRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated]

class BankDirectorRetrieveUpdateAPIView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated,IsDirector]
    queryset = BankDirector.objects.all()
    serializer_class = BankDirectorSerializer

class FinancialAnalystRetrieveUpdateAPIView(generics.RetrieveUpdateAPIView):
    queryset = FinancialAnalyst.objects.all()
    serializer_class = FinancialAnalystSerializer
    permission_classes =[permissions.IsAuthenticated]


class FinancialAnalystGet(APIView):
    permission_classes = [IsAuthenticated, IsAnalyst]

    def get(self, request, pk):
        analyst = get_object_or_404(FinancialAnalyst, pk=pk)
        serializer = FinancialAnalystSerializer(analyst)
        return Response(serializer.data, status=status.HTTP_200_OK)

   


class UserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        users = User.objects.exclude(role='director')
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

class UploadAvatarView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]

    def post(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        data = {'avatar': request.data.get('avatar')}
        serializer = UserSerializer(user, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ApproveUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        role = request.data.get('role')
        if role not in ['client', 'analyst']:
            return Response({'error': 'Invalid role'}, status=status.HTTP_400_BAD_REQUEST)
        
        if role == 'client':
            Client.objects.create(user=user, **request.data)
        elif role == 'analyst':
            FinancialAnalyst.objects.create(user=user, **request.data)

        user.role = role
        user.save()
        return Response({'status': 'User approved'}, status=status.HTTP_200_OK)


class UpdateUserRoleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        new_role = request.data.get('role')
        current_role = user.role

        if new_role not in ['client', 'analyst', 'director']:
            return Response({'error': 'Invalid role'}, status=status.HTTP_400_BAD_REQUEST)

        if new_role == current_role:
            return Response({'status': 'Role is unchanged'}, status=status.HTTP_200_OK)

        if current_role == 'client':
            Client.objects.filter(user=user).delete()
        elif current_role == 'analyst':
            FinancialAnalyst.objects.filter(user=user).delete()

        if new_role == 'client':
            if not Client.objects.filter(user=user).exists():
                Client.objects.create(
                    user=user,
                    first_name=request.data.get('first_name', user.first_name),
                    last_name=request.data.get('last_name', user.last_name),
                    income=request.data.get('income', 0),
                    phone_number=request.data.get('phone_number', ''),
                    address=request.data.get('address', '')
                )
        elif new_role == 'analyst':
            if not FinancialAnalyst.objects.filter(user=user).exists():
                FinancialAnalyst.objects.create(
                    user=user,
                    first_name=request.data.get('first_name', user.first_name),
                    last_name=request.data.get('last_name', user.last_name),
                    bank_department_number=request.data.get('bank_department_number', ''),
                    phone_number=request.data.get('phone_number', '')
                )

        user.role = new_role
        user.save()

        return Response({'status': 'User role updated successfully'}, status=status.HTTP_200_OK)


class DeleteUserView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        user.delete()
        return Response({'status': 'User deleted'}, status=status.HTTP_200_OK)

class BlockUnblockUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        action = request.data.get('action')
        if action not in ['block', 'unblock']:
            return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)
        
        user.is_active = action == 'unblock'
        user.save()
        return Response({'status': f'User {action}ed'}, status=status.HTTP_200_OK)



class UpdateClientView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        client = get_object_or_404(Client, user_id=user_id)
        serializer = ClientSerializer(client, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UpdateFinancialAnalystView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        analyst = get_object_or_404(FinancialAnalyst, user_id=user_id)
        serializer = FinancialAnalystSerializer(analyst, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


