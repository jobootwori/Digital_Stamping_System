from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Document, Stamp
from .serializers import DocumentSerializer, StampSerializer

class DocumentUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = DocumentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class StampListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        stamps = Stamp.objects.filter(user=request.user)
        serializer = StampSerializer(stamps, many=True)
        return Response(serializer.data)
