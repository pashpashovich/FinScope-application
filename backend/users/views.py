from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from .serializers import UserSerializer
from users.models import User
from rest_framework.exceptions import AuthenticationFailed
from django.utils.decorators import method_decorator
from rest_framework import permissions, status
from clients.serializers import ClientSerializer
from django.http import JsonResponse
from rest_framework import generics, status






class LoginView(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not user.is_active:
            return Response({'error': 'Account is inactive'}, status=status.HTTP_403_FORBIDDEN)
        
        user = authenticate(request, email=email, password=password)
        if user is not None:
            login(request, user)
            return Response({
                'id': user.id,
                'role': user.role
            })
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)




class LogoutView(APIView):
	permission_classes = (permissions.AllowAny,)
	authentication_classes = ()
	def post(self, request):
		logout(request)
		return Response(status=status.HTTP_200_OK)

class UserRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()


class RegisterView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = ()


    def post(self, request):
        serializer = UserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    
@api_view(['GET'])
@permission_classes([AllowAny])
def check_email(request):
    email = request.GET.get('email')
    if not email:
        return JsonResponse({'error': 'Email parameter is required'}, status=400)

    exists = User.objects.filter(email=email).exists()
    return JsonResponse({'exists': exists})