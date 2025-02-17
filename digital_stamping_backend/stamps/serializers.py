from rest_framework import serializers
from .models import Document, Stamp, CustomUser
from rest_framework import serializers
from django.contrib.auth import get_user_model,authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = ('user')

class StampSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stamp
        fields = ['id', 'user', 'shape', 'color', 'text', 'sub_text', 'text_color', 'size', 'logo', 'x', 'y']
        read_only_fields = ['id', 'user']  # Ensure `user` is read-only

    def create(self, validated_data):
        # Get the current user from the request
        request = self.context.get('request')
        validated_data['user'] = request.user  # Automatically associate the logged-in user
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
        )
        return user

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
        attrs['user'] = user
        return attrs

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model =CustomUser
        fields = ('id', 'first_name', 'last_name', 'email')