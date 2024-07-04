from graphql_client import GraphqlClient

#endpoint='https://evtvuoexezftvoibf6iz4rnavi.appsync-api.us-east-1.amazonaws.com/graphql'
endpoint = 'https://whhcgslnqbhknh5zqybbmsluou.appsync-api.us-east-1.amazonaws.com/graphql'
endpoint = 'https://eoeyurundne2tptzu5xrc4b2qu.appsync-api.eu-west-2.amazonaws.com/graphql'
#api_key = 'da2-rqjhb2hgs5etbctwgsgygshwl4'
api_key = 'da2-zapwyty7hjh2tccygvm7m4kywi'
api_key = 'da2-fp7ih35fpvgqvcbvlriqmzooqm'

gq_client = GraphqlClient(
    endpoint=endpoint,
    headers={'x-api-key': api_key}
)

##########################################
#
# Favourite Movies queries/mutation
#
#result = gq_client.execute(
#    query="""
#query listFavoriteMovies {
#  listFavoriteMovies {
#    items {
#      id
#      title
#      rating
#    }
#  }
#}
#
#""", 
#    operation_name='listFavoriteMovies'
#)
#print(result)
#
#result = gq_client.execute(query= """
#mutation createFavoriteMovies($createfavoritemoviesinput: CreateFavoriteMoviesInput!) {
#  createFavoriteMovies(input: $createfavoritemoviesinput) {
#    id
#    title
#    rating
#  }
#}
#""", 
#    operation_name='createFavoriteMovies',
#    variables={
#        "createfavoritemoviesinput": {
#            "title": "The Piano", 
#            "rating": 45
#        }
#    }
#)


##########################################
#
# Note queries/mutation
#
result = gq_client.execute(
    query="""
query listStanceRecords {
  listStanceRecords {
    items {
      id
      boxer_names
      detection_bounding_box
    }
  }
}

""", 
    operation_name='listStanceRecords'
)
print(result)
print('---------------------------------------------------')

result = gq_client.execute(query= """
mutation createFavouriteMovies($createfavouritemoviesinput: CreateFavouriteMoviesInput!) {
  createFavouriteMovies(input: $createfavouritemoviesinput) {
    id
    title
    rating
  }
}
""", 
    operation_name='createFavouriteMovies',
    variables={
        "createfavouritemoviesinput": {
            "title": "Thor: Ragnarok", 
            "rating": 10
        }
    }
)
print(result)
print('-----------------------------------------------------')

status = "initial"
bbox = [182,237,41,9]
result = gq_client.execute(query= """
mutation createStanceRecord($createstancerecordinput: CreateStanceRecordInput!) {
  createStanceRecord(input: $createstancerecordinput) {
    id
    boxer_names
    detection_bounding_box
    frame_number
  }
}
""",
    operation_name='createStanceRecord',
    variables={
       "createstancerecordinput": {
          "status": status,
          "boxer_names": ["hello"],
          "detection_bounding_box": bbox,
          "frame_number": 30,
        "frame_path": "",
        "source_video_url": "",
       }   
    }
)
print(result)
