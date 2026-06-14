from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, Event, Registration


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, label='Confirm password')

    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'password', 'password2', 'created_at')
        read_only_fields = ('id', 'created_at')

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password2'):
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'created_at')
        read_only_fields = ('id', 'created_at')


class EventSerializer(serializers.ModelSerializer):
    registration_count = serializers.IntegerField(read_only=True)
    is_registered = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = ('id', 'title', 'description', 'date', 'location', 'created_at',
                  'registration_count', 'is_registered')
        read_only_fields = ('id', 'created_at', 'registration_count', 'is_registered')

    def get_is_registered(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.registrations.filter(user=request.user).exists()
        return False


class RegistrationSerializer(serializers.ModelSerializer):
    event = EventSerializer(read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = Registration
        fields = ('id', 'user', 'event', 'registered_at')
        read_only_fields = ('id', 'registered_at')
