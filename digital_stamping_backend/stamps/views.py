from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Document, Stamp
from .serializers import DocumentSerializer, StampSerializer, RegisterSerializer, UserSerializer, LoginSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail
from django.utils.timezone import now

from django.contrib.auth import get_user_model

User = get_user_model()

from django.core.mail import send_mail
from django.utils.timezone import now
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()

class GenerateOTPView(APIView):
    permission_classes = [AllowAny]  # Allow public access

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            user.generate_otp()  # Generate OTP and set expiry

            # Send OTP via email
            send_mail(
                "Your OTP Code",
                f"Your OTP code is {user.otp}. It expires in 10 minutes.",
                "your-email@gmail.com",  # Sender email
                [user.email],
                fail_silently=False,
            )

            return Response({"message": "OTP sent successfully"}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")

        if not email or not otp:
            return Response({"error": "Email and OTP are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            if user.is_otp_valid(otp):
                user.otp = None  # Clear OTP after verification
                user.otp_expiry = None
                user.is_active = True  # Activate account
                user.save()
                return Response({"message": "OTP verified successfully"}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Invalid or expired OTP"}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

class GenerateSerialNumberView(APIView):
    permission_classes = [IsAuthenticated]  # Restrict access to authenticated users

    def get(self, request):
        """Generate a new serial number and return it to the frontend."""
        document = Document()
        document.generate_serial_number()
        return Response({"serial_number": document.serial_number})

class DocumentUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = DocumentSerializer(data=request.data)
        if serializer.is_valid():
            document = serializer.save(user=request.user)
            return Response({
                "message": "Document uploaded successfully!",
                "serial_number": document.serial_number,
                "qr_code": request.build_absolute_uri(document.qr_code.url),
            }, status=status.HTTP_201_CREATED) 
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DocumentSaveView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = DocumentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DocumentListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        documents = Document.objects.filter(user=request.user)
        serializer = DocumentSerializer(documents, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class VerifySerialNumberView(APIView):
    permission_classes = [AllowAny]  # Public endpoint

    def get(self, request, serial_number):
        """Verify a document using its serial number."""
        try:
            document = Document.objects.get(serial_number=serial_number)
            return Response({
                "valid": True,
                "message": "Document is valid.",
                "serial_number": document.serial_number,
                "created_at": document.created_at,
                "owner": document.user.email if document.user else "Anonymous",
            })
        except Document.DoesNotExist:
            return Response({
                "valid": False,
                "message": "Invalid serial number. Document not found."
            }, status=status.HTTP_404_NOT_FOUND)


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