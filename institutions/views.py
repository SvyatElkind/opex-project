"""Module contains api views for institutions app."""

from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from helpers.constants import ERROR, MSG_E_UNPREDICTIBLE_ERROR_OCCURED
from institutions.models import Institution
from institutions.serializers import InstitutionSerializer

class InstitutionAPIView(APIView):
    """API view for institution app interaction."""
    serializer_class = InstitutionSerializer

    def put(self, request, project_id, institution_id):
        """Update institution data."""
        institution = get_object_or_404(Institution, id=institution_id)
        serializer = self.serializer_class(institution, data=request.data, partial=True)
        
        if serializer.is_valid():

            try:
                serializer.save()
            except ValidationError as ex:
                return Response(data=ex.args[0], status=status.HTTP_400_BAD_REQUEST)
            except:
                return Response({ERROR: MSG_E_UNPREDICTIBLE_ERROR_OCCURED}, status=status.HTTP_400_BAD_REQUEST)
            
            return Response(data=serializer.data, status=status.HTTP_200_OK)
        
        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)