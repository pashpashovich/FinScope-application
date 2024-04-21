from rest_framework import serializers

from .models import Account, Client


class AccountSerializer(serializers.ModelSerializer):
    client_id = serializers.PrimaryKeyRelatedField(queryset=Client.objects.all())

    class Meta:
        model = Account
        fields = '__all__'

    
  
    
