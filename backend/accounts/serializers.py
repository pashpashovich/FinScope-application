from rest_framework import serializers
from .models import Account, CheckingAccount,SavingsAccount,CreditAccount,SocialAccount
from  clients.models import Client

class AccountSerializer(serializers.ModelSerializer):
    client_id = serializers.PrimaryKeyRelatedField(queryset=Client.objects.all())
    class Meta:
        model = Account
        fields = ['account_num', 'currency', 'client_id', 'account_balance', 'open_date', 'account_activity']


class CheckingAccountSerializer(serializers.ModelSerializer):
    account_type = serializers.SerializerMethodField() 
    class Meta:
        model = CheckingAccount
        fields = ['account_num', 'client_id', 'currency','account_balance', 'open_date', 'account_activity', 'overdraft_limit', 'account_type'] # Include account_type
    def get_account_type(self, obj):
        return obj.__class__.__name__ 

class SavingsAccountSerializer(serializers.ModelSerializer):
    account_type = serializers.SerializerMethodField() 
    class Meta:
        model = SavingsAccount
        fields = ['account_num', 'client_id', 'currency' , 'account_balance', 'open_date', 'account_activity', 'interest_rate', 'account_type'] # Include account_type
    def get_account_type(self, obj):
        return obj.__class__.__name__  

class CreditAccountSerializer(serializers.ModelSerializer):
    account_type = serializers.SerializerMethodField()  
    class Meta:
        model = CreditAccount
        fields = ['account_num', 'client_id', 'currency', 'account_balance', 'open_date', 'account_activity', 'credit_limit', 'account_type'] # Include account_type
    def get_account_type(self, obj):
        return obj.__class__.__name__  

class SocialAccountSerializer(serializers.ModelSerializer):
    account_type = serializers.SerializerMethodField()  
    class Meta:
        model = SocialAccount
        fields = ['account_num', 'client_id', 'currency', 'account_balance', 'open_date', 'account_activity', 'social_payments', 'account_type'] # Include account_type
    def get_account_type(self, obj):
        return obj.__class__.__name__  