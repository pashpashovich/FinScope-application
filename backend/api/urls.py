from django.urls import path
from .views import HomePageView,LoginPageView,ProfilePageView, DataPageView,AnalysePageView, transaction_analytics_view, ReportAPIView



urlpatterns = [
    path('', HomePageView.as_view(), name='home'),  
    path('login/', LoginPageView.as_view()),  
    path('profile/', ProfilePageView.as_view()),  
    path('data/', DataPageView.as_view()),  
    path('analyse/', AnalysePageView.as_view()),  
    path('analytics/', transaction_analytics_view, name='transaction-analytics'),
    path('report/', ReportAPIView.as_view()),

]
