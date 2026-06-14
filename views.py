from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import User, Event, Registration
from .serializers import (
    RegisterSerializer, UserSerializer,
    EventSerializer, RegistrationSerializer
)


class RegisterView(generics.CreateAPIView):
    """POST /api/register — Create a new user account."""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)


class LoginView(TokenObtainPairView):
    """POST /api/login — Obtain JWT access + refresh tokens."""
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            from rest_framework_simplejwt.tokens import AccessToken
            token = AccessToken(response.data['access'])
            user = User.objects.get(id=token['user_id'])
            response.data['user'] = UserSerializer(user).data
        return response


class LogoutView(APIView):
    """POST /api/logout — Blacklist the refresh token."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'detail': 'Logged out successfully.'})
        except Exception:
            return Response({'detail': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)


class MeView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/me — Retrieve or update current user profile."""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class EventListView(generics.ListAPIView):
    """GET /api/events — List all events, with optional search."""
    serializer_class = EventSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = Event.objects.all()
        search = self.request.query_params.get('search', '').strip()
        if search:
            qs = qs.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(location__icontains=search)
            )
        return qs

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx


class EventDetailView(generics.RetrieveAPIView):
    """GET /api/events/:id — Retrieve a single event."""
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [AllowAny]

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx


class EventRegisterView(APIView):
    """POST /api/events/:id/register — Register current user for an event."""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        event = get_object_or_404(Event, pk=pk)
        registration, created = Registration.objects.get_or_create(
            user=request.user,
            event=event
        )
        if not created:
            return Response(
                {'detail': 'You are already registered for this event.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer = RegistrationSerializer(registration)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def delete(self, request, pk):
        event = get_object_or_404(Event, pk=pk)
        registration = Registration.objects.filter(user=request.user, event=event).first()
        if not registration:
            return Response(
                {'detail': 'You are not registered for this event.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        registration.delete()
        return Response({'detail': 'Registration cancelled.'}, status=status.HTTP_200_OK)


class MyRegistrationsView(generics.ListAPIView):
    """GET /api/my-registrations — List all events the current user registered for."""
    serializer_class = RegistrationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Registration.objects.filter(user=self.request.user).select_related('event')
