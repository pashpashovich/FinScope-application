from rest_framework.renderers import TemplateHTMLRenderer
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts.models import Account


class AccountList(APIView):
    renderer_classes = [TemplateHTMLRenderer]
    template_name = 'account_list.html'

    def get(self, request):
        queryset = Account.objects.all()
        return Response({'account': queryset})
