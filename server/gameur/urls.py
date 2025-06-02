from django.urls import path
from . import views

urlpatterns = [
    path('gamers/', views.gamer_list_view, name='gamer_list'), # Assure-toi que le chemin est 'gamers/'
    # ... autres urls de l'application
]