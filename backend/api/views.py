from django.shortcuts import render
from django.views.generic import TemplateView

class HomePageView(TemplateView):
    template_name = 'main.html'

class LoginPageView(TemplateView):
    template_name = 'auth.html'

class ProfilePageView(TemplateView):
    template_name = 'profile.html'


class  DataPageView(TemplateView):
    template_name = 'data.html'

class  AnalysePageView(TemplateView):
    template_name = 'analyse.html'