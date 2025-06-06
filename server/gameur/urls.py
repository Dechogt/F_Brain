from django.urls import path
from . import views
from django.urls import path

urlpatterns = [
    
    path('user/', views.user_profile_view, name='user_profile'), # URL pour le profil de l'utilisateur connecté
    path('gamers/', views.gamer_list_view, name='gamer_list'), # URL pour la liste des gamers (classement)
    path('gamers/create/', views.gamer_create_update_view, name='gamer_create_update'), # URL pour créer/mettre à jour un profil
    # path('gamers/<int:pk>/', views.gamer_detail_view, name='gamer_detail'), # Exemple pour un profil spécifique par ID
    # path('gamers/<str:pseudo>/', views.gamer_detail_view_by_pseudo, name='gamer_detail_by_pseudo'), # Exemple par pseudo
    # ... autres urls de l'application
]
