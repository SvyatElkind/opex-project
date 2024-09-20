"""Module contains api views for institutions app."""


from django.core.exceptions import ValidationError
from rest_framework.views import APIView

from helpers.constants import ERROR, MSG_E_UNPREDICTIBLE_ERROR_OCCURED
from helpers.mixins import ProjectRelationMixin, ResponseMixin
from institutions.models import Institution
from institutions.serializers import InstitutionSerializer


class InstitutionAPIView(ProjectRelationMixin, ResponseMixin, APIView):
    """API view for institution app interaction."""
    serializer_class = InstitutionSerializer

    def put(self, request, project_id, institution_id):
        """Update institution data."""
        try:
            institution = self.get_validated_object(project_id, Institution, institution_id)
        except ValidationError as ex:
            return self.response(ex.args[0], 400)
        except Exception as ex:
            return self.response({ERROR: MSG_E_UNPREDICTIBLE_ERROR_OCCURED}, 400)
         
        serializer = self.serializer_class(institution, data=request.data, partial=True)
        
        if serializer.is_valid():

            try:
                serializer.save()
            except ValidationError as ex:
                return self.response(ex.args[0], 400)
            except Exception as ex:
                return self.response({ERROR: MSG_E_UNPREDICTIBLE_ERROR_OCCURED}, 400)
            
            return self.response(serializer.data, 200)
        
        return self.response(serializer.errors, 400)
