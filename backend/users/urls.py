from django.urls import path
from .views import UserRetrieveUpdateDestroyAPIView,LoginView, LogoutView, RegisterView,check_email

urlpatterns = [
    path('register', RegisterView.as_view(),name='reg'),
    path('login', LoginView.as_view()),
    path('<int:pk>/', UserRetrieveUpdateDestroyAPIView.as_view(), name="user"),
    path('logout', LogoutView.as_view()),
    path('check-email', check_email, name='check_email'),
]