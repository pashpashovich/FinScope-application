from django.urls import path


from . import views

urlpatterns = [
    path('', views.AccountCreateAPIView.as_view(), name='account-list'),
    path('<int:pk>/', views.AccountRetrieveUpdateDestroyAPIView.as_view(), name='account-detail'),
    path('exact/<int:client_id>/', views.AccountListByClientIdAPIView.as_view(), name='account-list-by-client'),

]