import uuid
import boto3

def create_dynamodb_record(table_name, new_item):
    # Initialize a session using your credentials and specify the region
    session = boto3.Session()

    # Initialize the DynamoDB resource
    dynamodb = session.resource('dynamodb')
    
    # Select your DynamoDB table
    table = dynamodb.Table(table_name)

    # Put the new item into the table
    response = table.put_item(
       Item=new_item
    )
    return response

def create_record(num):
    # Generate a unique UUID for the 'id'
    unique_id = str(uuid.uuid4())  # Convert UUID format to a string

    # Define the new record with 'id' changed to 'Temp 3'
    new_record = {
        "id": unique_id,  # Use plain string
        "boxer1": "Crawford",  # Use plain string
        "boxer2": "Porter",  # Use plain string
        "date": "2021-11-20Z",  # Use plain string
        "description": f"Crawford v Porter - 20 Nov 2021",  # Use plain string
        "fps": 60,  # Use integer
        "num_camera_views": 1,  # Use integer
        "round": 1,  # Use integer
        "source_urls": [
            "https://do5dznmsu0r6j.cloudfront.net/Crawford_Porter_Round_1.mp4",
        ]  # List of strings
    }
    
    # Function call
    response = create_dynamodb_record('VideoDataSource', new_record)
    print(response)
    

create_record(0)
