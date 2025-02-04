from rest_framework import serializers
from .models import Document, Stamp, CustomUser
from rest_framework import serializers
from django.utils import timezone
from django.contrib.auth import get_user_model,authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
import random

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = '__all__'

class StampSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stamp
        fields = ['id', 'user', 'shape', 'color', 'text', 'sub_text', 'text_color', 'size', 'logo', 'x', 'y']
        read_only_fields = ['id', 'user']  # Ensure `user` is read-only

    def create(self, validated_data):
        # Get the current user from the request
        request = self.context.get('request')
        user = request.user

        # Ensure OTP verification before stamp creation
        if not user.otp_verified:
            raise serializers.ValidationError({"otp": "User must complete OTP verification to create stamps."})

        validated_data['user'] = user  # Automatically associate the logged-in user
        return super().create(validated_data)

# User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(required=True, max_length=50)
    last_name = serializers.CharField(required=True, max_length=50)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = CustomUser
        fields = ('first_name', 'last_name', 'email', 'password', 'password2')

    def validate_email(self, value):
        # Check if email already exists
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value

    def validate(self, attrs):
         # Check if passwords match
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):

        # Remove password and password2 from validated_data before creating user
        validated_data.pop('password2', None)
       
        # Create user with validated_data
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            is_verified=False  # User needs to verify email first
        )

        # # Generate and store email verification otp
        # otp_code = str(random.randint(100000, 999999))  # 6-digit OTP
        # user.otp_code = otp_code  # Store OTP in the user model
        # user.otp_created_at = timezone.now()
        # user.save()

        # # Send otp verification email
        # send_mail(
        #     "Verify Your Email",
        #     f"Your OTP is {otp_code}. It will expire in 10 minutes.",
        #     "noreply@gmail.com",
        #     [user.email],
        #     fail_silently=False,
        # )
        return user

class EmailVerificationSerializer(serializers.Serializer):
    token = serializers.UUIDField()

    def validate_token(self, value):
        try:
            user = CustomUser.objects.get(verification_token=value)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("Invalid verification token.")
        
        return value

class OTPRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

class OTPVerificationSerializer(serializers.Serializer):
    # email = serializers.EmailField()
    otp_code = serializers.CharField(max_length=6)

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        # Authenticate the user
        user = authenticate(username=email, password=password)
        if not user:
            raise serializers.ValidationError("Invalid email or password.")

        if not user.is_verified:
            raise serializers.ValidationError("Email not verified. Please verify before logging in.")

        attrs['user'] = user
        return attrs

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model =CustomUser
        fields = ('id', 'first_name', 'last_name', 'email', 'is_verified', 'otp_verified')

