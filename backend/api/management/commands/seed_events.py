from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from api.models import Event


SAMPLE_EVENTS = [
    {
        "title": "React & Django Full-Stack Workshop",
        "description": "A hands-on workshop covering modern full-stack development with React and Django REST Framework. You'll build a complete CRUD application from scratch.",
        "location": "Infopark, Kochi, Kerala",
        "days_from_now": 7,
    },
    {
        "title": "Cloud Native & Kubernetes Summit",
        "description": "Deep dive into container orchestration, microservices, and cloud-native patterns. Featuring talks from engineers at major tech companies.",
        "location": "Technopark, Trivandrum, Kerala",
        "days_from_now": 14,
    },
    {
        "title": "AI/ML for Developers Bootcamp",
        "description": "Practical machine learning with Python. Topics include data preprocessing, model training, and deploying ML models as REST APIs.",
        "location": "Cyberpark, Kozhikode, Kerala",
        "days_from_now": 21,
    },
    {
        "title": "Open Source Contribution Day",
        "description": "A community event where developers collaborate on open source projects. Mentors will be available to help first-time contributors.",
        "location": "Infopark, Kochi, Kerala",
        "days_from_now": 10,
    },
    {
        "title": "Design Systems & UI Engineering",
        "description": "Learn how to build scalable design systems that bridge the gap between designers and developers.",
        "location": "Technopark, Trivandrum, Kerala",
        "days_from_now": 30,
    },
    {
        "title": "Cybersecurity & Ethical Hacking",
        "description": "Introduction to ethical hacking, penetration testing, and securing web applications. CTF challenges included.",
        "location": "Cyberpark, Kozhikode, Kerala",
        "days_from_now": 45,
    },
]


class Command(BaseCommand):
    help = 'Seed the database with sample events'

    def handle(self, *args, **options):
        Event.objects.all().delete()
        for data in SAMPLE_EVENTS:
            Event.objects.create(
                title=data['title'],
                description=data['description'],
                location=data['location'],
                date=timezone.now() + timedelta(days=data['days_from_now']),
            )
        self.stdout.write(self.style.SUCCESS(f'Created {len(SAMPLE_EVENTS)} sample events.'))