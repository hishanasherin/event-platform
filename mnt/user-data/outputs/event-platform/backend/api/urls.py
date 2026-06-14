from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, LoginView, LogoutView, MeView,
    EventListView, EventDetailView, EventRegisterView,
    MyRegistrationsView,
)

urlpatterns = [
    path('register', RegisterView.as_view(), name='register'),
    path('login', LoginView.as_view(), name='login'),
    path('logout', LogoutView.as_view(), name='logout'),
    path('token/refresh', TokenRefreshView.as_view(), name='token_refresh'),
    path('me', MeView.as_view(), name='me'),
    path('events', EventListView.as_view(), name='event-list'),
    path('events/<int:pk>', EventDetailView.as_view(), name='event-detail'),
    path('events/<int:pk>/register', EventRegisterView.as_view(), name='event-register'),
    path('my-registrations', MyRegistrationsView.as_view(), name='my-registrations'),
]
