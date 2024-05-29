from rest_framework import serializers
from .models import Transaction

class TransactionSerializer(serializers.ModelSerializer):
    formatted_time = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = '__all__'

    def get_formatted_time(self, obj):
        return obj.transaction_time.strftime('%Y-%m-%d %H:%M:%S')