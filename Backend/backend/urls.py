from django.contrib import admin
from django.http import HttpResponse
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static


def home(request):
    return HttpResponse("<h1>Hello Venky 🚀</h1>")

urlpatterns = [
    path('', home),  # <-- this fixes the 404 at /
    path('api/', include('api.urls')),
    path('admin/', admin.site.urls),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)