import requests

#endpoint="https://httpbin.org"
endpoint="http://localhost:8000/api/"

get_response=requests.post(endpoint,json={"query":"Hello,world!"})
#print(get_response.headers)
#print(get_response.text)
print(get_response.json())
