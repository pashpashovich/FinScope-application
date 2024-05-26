from django.urls import path
from . import views

urlpatterns = [
    path('', views.ClientListCreateAPIView.as_view(), name='client-list'),
    path('<int:pk>/', views.ClientRetrieveUpdateDestroyAPIView.as_view(), name='client-detail'),
    path('bank-director/<int:pk>/', views.BankDirectorRetrieveUpdateAPIView.as_view(), name='bank-director-detail'),
    path('financial-analyst/<int:pk>/', views.FinancialAnalystRetrieveUpdateAPIView.as_view(), name='financial-analyst-detail'),
    path('upload-avatar/<int:user_id>/', views.UploadAvatarView.as_view(), name='upload-avatar'),
    path('users/', views.UserListView.as_view(), name='users'),
    path('block-unblock-user/<int:user_id>/', views.BlockUnblockUserView.as_view(), name='block-unblock-user'),
    path('delete-user/<int:user_id>/', views.DeleteUserView.as_view(), name='delete-user'),
    path('client/<int:user_id>/', views.UpdateClientView.as_view(), name='update-client'),
    path('analyst/<int:user_id>/', views.UpdateFinancialAnalystView.as_view(), name='update-analyst'),
    path('update-role/<int:user_id>/', views.UpdateUserRoleView.as_view(), name='update-role'),
]

