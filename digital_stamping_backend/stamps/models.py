

# Create your models here.
import qrcode
from io import BytesIO
from django.core.files.base import ContentFile
import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager, Group
from django.contrib.auth.hashers import make_password
from django.conf import settings  # Import settings to use AUTH_USER_MODEL

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

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    username = None

    USERNAME_FIELD = 'email' # Use email as the username field
    REQUIRED_FIELDS = ['first_name', 'last_name']  # Do not include 'email' here

    objects = CustomUserManager()

    def __str__(self):
        return self.email

    def get_user_group(self):
        """Returns the first group name assigned to the user."""
        return self.groups.first().name if self.groups.exists() else None


class Document(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    file = models.FileField(upload_to='documents/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    serial_number = models.CharField(max_length=50, unique=True, blank=True, null=True)
    qr_code = models.ImageField(upload_to='qr_codes/', blank=True, null=True)

    def generate_serial_number(self):
        """Generate a unique serial number"""
        self.serial_number = str(uuid.uuid4().hex[:10]).upper()

    def generate_qr_code(self):
        """Generate a QR code containing document metadata and verification link"""
        if not self.serial_number:
            self.generate_serial_number()

        verification_url = f"https://127.0.0.1/verify/{self.serial_number}"
        qr = qrcode.make(verification_url)

        buffer = BytesIO()
        qr.save(buffer, format="PNG")
        self.qr_code.save(f"{self.serial_number}.png", ContentFile(buffer.getvalue()), save=False)
    
    def save(self, *args, **kwargs):
        if not self.serial_number:
            self.generate_serial_number()
        self.generate_qr_code()
        super().save(*args, **kwargs)

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