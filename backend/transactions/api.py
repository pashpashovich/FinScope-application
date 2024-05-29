import requests
from datetime import datetime, timedelta

def get_сonvert(amount,from_currency,to_currency):
        amount = float(amount)
        response = requests.get('https://www.nbrb.by/api/exrates/rates?periodicity=0')
        rates = response.json()
        rates_map = {rate['Cur_Abbreviation']: rate['Cur_OfficialRate'] for rate in rates}
        scale_map = {rate['Cur_Abbreviation']: rate['Cur_Scale'] for rate in rates}
        rates_map['BYN'] = 1.0  

        if from_currency != 'BYN':
            base_amount = amount * rates_map[from_currency] / scale_map[from_currency]
        else:
            base_amount = amount

        if to_currency != 'BYN':
            converted_amount = base_amount / rates_map[to_currency] * scale_map[to_currency]
        else:
            converted_amount = base_amount

        return converted_amount