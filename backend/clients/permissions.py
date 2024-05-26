from rest_framework.permissions import BasePermission
import jwt

class IsAnalyst(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == 'analyst'