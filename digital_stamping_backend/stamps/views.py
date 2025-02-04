from django.shortcuts import render, get_object_or_404

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Document, Stamp, CustomUser
from .serializers import DocumentSerializer, StampSerializer, RegisterSerializer, UserSerializer, LoginSerializer, EmailVerificationSerializer, OTPRequestSerializer, OTPVerificationSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from django.contrib.auth import get_user_model

from django.core.mail import send_mail

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # Pass the data to the serializer
        serializer = RegisterSerializer(data=request.data)

        # Perform validation and return errors if any
        if serializer.is_valid():
            user = serializer.save()

            # Send email verification link
            # send_mail(
            #     "Verify Your Email",
            #     f"Click the link to verify your email: http://example.com/verify-email/{user.verification_token}/",
            #     "noreply@example.com",
            #     [user.email],
            #     fail_silently=False,
            # )

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)

            return Response(
                {
                    "message": "User created successfully! Proceed with OTP verification.",
                    "access": access_token,
                    "refresh": str(refresh),
                },
                status=status.HTTP_201_CREATED,
            )

            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = OTPVerificationSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp_code = serializer.validated_data['otp_code']

            user = CustomUser.objects.filter(email=email).first()

            if not user:
                return Response({"error": "User Not Found."}, status=status.HTTP_400_BAD_REQUEST)
            
            if timezone.now() > user.otp_expires_at:
                return Response({"error": "OTP expired."}, status=status.HTTP_400_BAD_REQUEST)

            if user.verify_otp(otp_code):
                user.is_verified = True
                user.otp_code = None  # Clear OTP after verification
                user.otp_created_at = None
                user.save()
                return Response({"message": "OTP verified successfully!"}, status=status.HTTP_200_OK)
            return Response({"error": "Invalid or expired OTP."}, status=status.HTTP_400_BAD_REQUEST)

            user.is_verified = True
            user.save()
            return Response({"message": "Email verified successfully."}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RequestOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = OTPRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = CustomUser.objects.filter(email=email).first()

            if not user:
                return Response({"error": "User not found."}, status=status.HTTP_400_BAD_REQUEST)

            otp_code = user.generate_otp()
            send_mail(
                "Your OTP Code",
                f"Your OTP is {otp_code}. It will expire in 10 minutes.",
                "noreply@gmail.com",
                [user.email],
                fail_silently=False,
            )
            return Response({"message": "OTP sent to your email."}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyOTPView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = OTPVerificationSerializer(data=request.data)
        if serializer.is_valid():
            otp_code = serializer.validated_data['otp_code']
            # Check if the OTP matches the stored one
            if request.user.verify_otp(otp_code):
                request.user.save()
                return Response({"message": "OTP verification successful!"}, status=status.HTTP_200_OK)
            return Response({"error": "Invalid or expired OTP."}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DocumentUploadView(APIView):
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
        if not request.user.otp_verified:
            return Response({"error": "User must complete OTP verification to create stamps."}, status=status.HTTP_400_BAD_REQUEST)

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