from django.urls import path


from . import views

urlpatterns = [
    path('', views.AccountCreateAPIView.as_view(), name='account-list'),
    path('create/', views.AccountCreateAPIView.as_view(), name='account-create'),
    path('<int:pk>/', views.AccountDetailAPIView.as_view(), name='account-detail'),
]