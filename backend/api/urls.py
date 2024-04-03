from django.urls import path
from .views import HomePageView,LoginPageView,ProfilePageView, DataPageView



urlpatterns = [
    path('', HomePageView.as_view(), name='home'),  
    path('login/', LoginPageView.as_view()),  
    path('profile/', ProfilePageView.as_view()),  
    path('data/', DataPageView.as_view()),  
]
