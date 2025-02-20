"""
URL configuration for digital_stamping_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from stamps.views import RegisterView, UserDetailView, DocumentUploadView, DocumentSaveView, DocumentListView, StampListView, StampCreateView, GenerateSerialNumberView, VerifySerialNumberView
from django.views.generic import RedirectView

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('register/', RegisterView.as_view(), name='register'),
    path("generate-otp/", GenerateOTPView.as_view(), name="generate-otp"),
    path("verify-otp/", VerifyOTPView.as_view(), name="verify-otp"),
    path('me/', UserDetailView.as_view(), name='user-detail'),
    path('upload/', DocumentUploadView.as_view(), name='document-upload'),
    path('generate-serial/', GenerateSerialNumberView.as_view(), name='generate-serial'),
    path('stamps/', StampListView.as_view(), name='stamp-list'),
    path('stamps/create/', StampCreateView.as_view(), name='stamp-create'),
    path('document/save/', DocumentSaveView.as_view(), name='document-save'),
    path('documents/', DocumentListView.as_view(), name='documents-list'),
    path('verify-serial/<str:serial_number>/', VerifySerialNumberView.as_view(), name='verify-serial'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # Login
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # Refresh Token
    path('', RedirectView.as_view(url='register/')),  # Redirect root to 'register/'
]