import json
#from django.http import JsonResponse,HttpResponse
from django.forms.models import model_to_dict
from accounts.models import Account

from rest_framework.response import Response

from rest_framework.decorators import api_view

from accounts.serializers import AccountSerializer

from django.http import JsonResponse

@api_view(["POST"])
def api_home(request,*args,**kwargs):
    serializer = AccountSerializer(data=request.data)
    return Response(data)