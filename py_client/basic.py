from django.shortcuts import render
import requests

endpoint="http://localhost:8000/api/"

get_response=requests.get(endpoint,json={"query":"Hello,world!"})

if get_response.status_code == 200:
    render(requests, 'py_client/templates/accounts.html', context={'data': get_response.json()})


