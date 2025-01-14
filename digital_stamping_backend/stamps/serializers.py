from rest_framework import serializers
from .models import Document, Stamp

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = '__all__'

class StampSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stamp
        fields = '__all__'
