from django import forms

from .models import Account


class AccountForm(forms.ModelForm):
    class Meta:
        model=Account
        fields = [
            'account_num',
            'account_type',
            'account_balance',
        ]