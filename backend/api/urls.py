from django.urls import path
from .views import HomePageView,LoginPageView,ProfilePageView, DataPageView, AnalysePageView



urlpatterns = [
    path('', HomePageView.as_view(), name='home'),  
    path('login/', LoginPageView.as_view()),  
    path('profile/', ProfilePageView.as_view()),  
    path('data/', DataPageView.as_view()),  
    path('analyse/', AnalysePageView.as_view()),  
]
