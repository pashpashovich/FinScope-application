from rest_framework import serializers
from .models import Client, BankDirector, FinancialAnalyst
from users.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'role', 'avatar']  # Добавлено поле avatar
        extra_kwargs = {
            'email': {'validators': []},
        }

class ClientSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Client
        fields = ['user_id', 'user', 'first_name', 'last_name', 'income', 'phone_number', 'address', 'date_created']

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = User.objects.create(**user_data)
        client = Client.objects.create(user=user, **validated_data)
        return client

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', None)
        if user_data:
            user = instance.user
            for attr, value in user_data.items():
                setattr(user, attr, value)
            user.save()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class BankDirectorSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = BankDirector
        fields = ['user_id', 'user', 'first_name', 'last_name', 'phone_number', 'bank_department_number']

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', None)
        if user_data:
            user = instance.user
            for attr, value in user_data.items():
                setattr(user, attr, value)
            user.save()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class FinancialAnalystSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = FinancialAnalyst
        fields = ['user_id', 'user', 'first_name', 'last_name', 'phone_number', 'bank_department_number']

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', None)
        if user_data:
            user = instance.user
            for attr, value in user_data.items():
                setattr(user, attr, value)
            user.save()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
