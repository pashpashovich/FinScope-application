from rest_framework.permissions import BasePermission
import jwt

class IsClient(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == 'client'
    
class IsAnalyst(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == 'analyst'

class IsDirector(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == 'director'