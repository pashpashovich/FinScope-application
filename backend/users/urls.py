from django.urls import path
from .views import RegisterView, LoginView, UserView, check_email,LogoutView

urlpatterns = [
    path('register', RegisterView.as_view(),name='reg'),
    path('login', LoginView.as_view(), name="log"),
    path('user', UserView.as_view(), name="user"),
    path('logout', LogoutView.as_view(), name="logout"),
    path('check-email', check_email, name='check_email'),
]