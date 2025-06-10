from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    # Inclut les URLs de l'application 'gameur' sous le préfixe /api/
    path('api/', include('gameur.urls')),
    # Si tu as d'autres applications avec des APIs, inclus-les aussi sous /api/
    # path('api/', include('autre_app.urls')),
    # Si tu as des vues non-API à la racine, définis-les ici
    # path('', views.home_page, name='home'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)