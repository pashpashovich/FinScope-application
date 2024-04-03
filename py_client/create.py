import requests

endpoint="http://localhost:8000/api/accounts/"

data = {
    'account_num':3,
    'client_id': 2,
    'account_type':'INVESTING',
    'account_balance': 500,
    'open_date': '2018-03-18',
    'account_activity': True
}
get_response=requests.post(endpoint,json=data)
print(get_response.json())