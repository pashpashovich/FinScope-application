from rest_framework import serializers

from .models import Account


class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model=Account
        fields = [
            'account_num',
            'client_id',
            'account_type',
            'account_balance',
            'open_date',
            'account_activity',
            'percentage',
        ]
    
  
    
