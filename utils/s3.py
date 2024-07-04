import logging
import boto3
from botocore.exceptions import ClientError
from io import StringIO

def download_file(bucket, key, to):
  s3 = boto3.client('s3')

  try:
    s3.download_file(bucket, key, to)
  except ClientError as e:
    logging.error(e)
    return False
  return True

def upload_file(file_name, bucket, object_name=None):
    """Upload a file to an S3 bucket
    :param file_name: File to upload
    :param bucket: Bucket to upload to
    :param object_name: S3 object name. If not specified then file_name is used
    :return: True if file was uploaded, else False
    """

    # If S3 object_name was not specified, use file_name
    if object_name is None:
        object_name = file_name

    # Upload the file
    s3_client = boto3.client('s3')
    try:
        response = s3_client.upload_file(file_name, bucket, object_name)
    except ClientError as e:
        logging.error(e)
        return False
    return True

def parse_s3_path(s3_path):
    path_components = s3_path.split('/')
    obucket = path_components[2]
    oname = '/'.join(path_components[3:])
    return obucket, oname

def get_file_list(path, excl_prefix_only=False):
    s3_client = boto3.client('s3')

    obucket, oname = parse_s3_path(path)

    all_keys = []

    continuation_token = None
    while True:
        list_kwargs = dict(MaxKeys=1000, Bucket=obucket, Prefix=oname)
        if continuation_token:
            list_kwargs['ContinuationToken'] = continuation_token
        response = s3_client.list_objects_v2(**list_kwargs)
        contents = response['Contents']
        keys = [c["Key"] for c in contents]
        all_keys.extend(keys)
        if not response['IsTruncated']:  # At the end of the list?
            break
        continuation_token = response.get('NextContinuationToken')
    
    if excl_prefix_only:
        all_keys = [k for k in all_keys if k != oname]

    return all_keys

def save_dataframe(df, to):
    bucket, key = parse_s3_path(to)
    csv_buffer = StringIO()
    df.to_csv(csv_buffer, index=False)
    s3_resource = boto3.resource('s3')
    s3_resource.Object(bucket, key).put(Body=csv_buffer.getvalue())

def move_object(s3_from, s3_to):
    print(f'[move_object] s3_from={s3_from}, s3_to={s3_to}')
    s3 = boto3.resource('s3')
    from_bucket, from_key = parse_s3_path(s3_from)
    to_bucket, to_key = parse_s3_path(s3_to)
    copy_source = {
        'Bucket': from_bucket,
        'Key': from_key
    }
    success = False
    state = "initial"
    try:
        s3.meta.client.copy(copy_source, to_bucket, to_key)
        state = "copied"
        s3.Object(from_bucket, from_key).delete()
        state = "source deleted"
        success = True
    except:
        success = False
    return success, state
