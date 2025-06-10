from django.urls import path
from . import views
from django.urls import path

urlpatterns = [
    path('user/', views.user_profile_view, name='user_profile'),
    path('gamers/', views.gamer_list_view, name='gamer_list'),
    path('gamers/create/', views.gamer_create_update_view, name='gamer_create_update'),
    
]
