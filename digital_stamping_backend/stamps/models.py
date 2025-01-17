

# Create your models here.
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings  # Import settings to use AUTH_USER_MODEL

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    def __str__(self):
        return self.username

class Document(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    file = models.FileField(upload_to='documents/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

class Stamp(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    shape = models.CharField(max_length=50, choices=[('circle', 'Circle'), ('rectangle', 'Rectangle')])
    color = models.CharField(max_length=7, default='#000000')  # Hex color code
    text = models.CharField(max_length=200, blank=True)
    logo = models.ImageField(upload_to='logos/', blank=True, null=True)
