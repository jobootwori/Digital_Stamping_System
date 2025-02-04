

# Create your models here.
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractUser, BaseUserManager, Group
from django.contrib.auth.hashers import make_password
from django.conf import settings  # Import settings to use AUTH_USER_MODEL
import uuid
import random

class CustomUserManager(BaseUserManager):
   def _create_user(self, email, password, **extra_fields):
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.password = make_password(password)
        user.save(using=self._db)

        # Assign a default group based on user type
        default_group_name = "Individual" if extra_fields.get("is_staff") is False else "Company"
        group, created = Group.objects.get_or_create(name=default_group_name)
        user.groups.add(group)

        return user

   def create_user(self, email, password, **extra_fields):
      extra_fields.setdefault("is_staff", False)
      extra_fields.setdefault("is_superuser", False)
      return self._create_user(email, password, **extra_fields)

   def create_superuser(self, email, password, **extra_fields):
      extra_fields.setdefault("is_staff", True)
      extra_fields.setdefault("is_superuser", True)

      if extra_fields.get("is_staff") is not True:
         raise ValueError("Superuser must have is_staff=True.")
      if extra_fields.get("is_superuser") is not True:
         raise ValueError("Superuser must have is_superuser=True.")

      return self._create_user(email, password, **extra_fields)

# def generate_uuid():
#     return str(uuid.uuid4())

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    username = None

    def default_verification_expires():
        return timezone.now() + timezone.timedelta(days=1)

     # Email Verification Fields
    is_verified = models.BooleanField(default=False)
    verification_token = models.UUIDField(unique=True, default=uuid.uuid4, editable=False)
    verification_expires_at = models.DateTimeField(default=timezone.now() + timezone.timedelta(days=1))

    # OTP Verification Fields
    otp_code = models.CharField(max_length=6, blank=True, null=True)
    otp_expires_at = models.DateTimeField(blank=True, null=True)
    otp_verified = models.BooleanField(default=False)


    USERNAME_FIELD = 'email' # Use email as the username field
    REQUIRED_FIELDS = ['first_name', 'last_name']  # Do not include 'email' here

    objects = CustomUserManager()

    def __str__(self):
        return self.email

    def get_user_group(self):
        """Returns the first group name assigned to the user."""
        return self.groups.first().name if self.groups.exists() else None
    
    def is_company(self):
        """Check if the user belongs to the Company group."""
        return self.get_user_group() == "Company"

    def generate_otp(self):
        """Generate a 6-digit OTP and set expiration (10 minutes)."""
        self.otp_code = str(random.randint(100000, 999999))
        self.otp_expires_at = timezone.now() + timezone.timedelta(minutes=10)
        self.save()
        return self.otp_code

    def verify_otp(self, otp):
        """Validate OTP before granting verification."""
        if not self.otp_expires_at or timezone.now() > self.otp_expires_at:
            self.otp_code = None  # Clear expired OTP
            self.otp_expires_at = None
            self.save()
            return False  

        if self.otp_code == otp:
            self.otp_verified = True
            self.otp_code = None
            self.otp_expires_at = None
            self.save()
            return True
        return False

class Document(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    file = models.FileField(upload_to='documents/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

class Stamp(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    shape = models.CharField(max_length=50, choices=[('circle', 'Circle'), ('rectangle', 'Rectangle')])
    color = models.CharField(max_length=7, default='#000000')  # Hex color code
    text = models.CharField(max_length=200, blank=True)
    sub_text = models.CharField(max_length=200, blank=True)
    logo = models.ImageField(upload_to='logos/', blank=True, null=True)
    text_color = models.CharField(max_length=7, default='#000000')
    size = models.IntegerField(null=True, blank=True)
    x = models.IntegerField(null=True, blank=True)
    y = models.IntegerField(null=True, blank=True)
   
    def __str__(self):
        return f"{self.text} ({self.shape})"  # Return the text and shape of the stamp