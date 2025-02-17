from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Document, Stamp
from .serializers import DocumentSerializer, StampSerializer, RegisterSerializer, UserSerializer, LoginSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from django.contrib.auth import get_user_model



class DocumentUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = DocumentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DocumentSaveView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = DocumentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class StampCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        print(f"User: {request.user}")  # Debugging: Check logged-in user
        serializer = StampSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()  # Automatically associate the logged-in user
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        print(serializer.errors)  # Debugging: Check errors
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class StampListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        stamps = Stamp.objects.filter(user=request.user)
        serializer = StampSerializer(stamps, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

User = get_user_model()

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # Pass the data to the serializer
        print(request.data)
        serializer = RegisterSerializer(data=request.data)

        # Perform validation and return errors if any
        if serializer.is_valid():
            user = serializer.save()
            return Response({"message": "User created successfully!"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)