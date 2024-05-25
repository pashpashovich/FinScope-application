from django.urls import path
from . import views

urlpatterns = [
    path('', views.ClientListCreateAPIView.as_view(), name='client-list'),
    path('<int:pk>/', views.ClientRetrieveUpdateDestroyAPIView.as_view(), name='client-detail'),
    path('bank-director/<int:pk>/', views.BankDirectorRetrieveUpdateAPIView.as_view(), name='bank-director-detail'),
    path('financial-analyst/<int:pk>/', views.FinancialAnalystRetrieveUpdateAPIView.as_view(), name='financial-analyst-detail'),
    path('upload-avatar/<int:user_id>/', views.upload_avatar, name='upload-avatar'),

]

