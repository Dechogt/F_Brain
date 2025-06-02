from django.shortcuts import render
from django.http import JsonResponse
from .models import Gamer, Game, GamerGame

def gamer_list_view(request):
    """Vue pour lister les gamers"""
    if request.method == 'GET':
        gamers = Gamer.objects.all()
        gamers_data = []
        
        for gamer in gamers:
            gamers_data.append({
                'id': gamer.id,
                'pseudo': gamer.pseudo,
                'level': gamer.level,
                'points': gamer.points,
                'created_at': gamer.created_at.isoformat()
            })
        
        return JsonResponse({'gamers': gamers_data})
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)