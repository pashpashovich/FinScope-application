from django.urls import path


from . import views

urlpatterns = [
    path('', views.AccountCreateAPIView.as_view(), name='account-list'),
    path('<int:pk>/', views.AccountRetrieveUpdateDestroyAPIView.as_view(), name='account-detail'),
    path('<int:pk>/checking', views.CheckingAccountByIdAPIView.as_view(),name='account-by-client-checking'),
    path('<int:pk>/savings', views.SavingAccountByIdAPIView.as_view(),name='account-by-client-saving'),
    path('<int:pk>/credit', views.CreditAccountByIdAPIView.as_view(),name='account-by-client-credit'),
    path('<int:pk>/socials', views.SocialAccountByIdAPIView.as_view(),name='account-by-client-social'),
    path('exact/<int:client_id>/socials', views.SocialAccountListByClientIdAPIView.as_view(), name='account-list-by-client-socials'),
    path('exact/<int:client_id>/credit', views.CreditAccountListByClientIdAPIView.as_view(), name='account-list-by-client-credit'),
    path('exact/<int:client_id>/savings', views.SavingsAccountListByClientIdAPIView.as_view(),name='account-list-by-client-savings'),
    path('exact/<int:client_id>/checking', views.CheckingAccountListByClientIdAPIView.as_view(),name='account-list-by-client-checking'),
    path('socials/', views.SocialAccountListAPIView.as_view(),
         name='account-list-socials'),
    path('credit/', views.CreditAccountListAPIView.as_view(),
         name='account-list-credit'),
    path('savings/', views.SavingsAccountListAPIView.as_view(),
         name='account-list-savings'),
    path('checking/', views.CheckingAccountListAPIView.as_view(),
         name='account-list-checking'),
     path('clients-accounts/', views.clients_accounts_data, name='clients_accounts_data'),

]