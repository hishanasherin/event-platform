from django.contrib import admin
from .models import User, Event, Registration


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'name', 'is_staff', 'created_at')
    search_fields = ('email', 'name')
    ordering = ('-created_at',)


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'date', 'location', 'registration_count', 'created_at')
    search_fields = ('title', 'location')
    ordering = ('date',)


@admin.register(Registration)
class RegistrationAdmin(admin.ModelAdmin):
    list_display = ('user', 'event', 'registered_at')
    list_filter = ('event',)
    ordering = ('-registered_at',)
