# Take 2 or more LabelSession punch data and generate a punch data match graph
# Separate graphs are built for each boxer. The graph is built as follows:
# 1) First for each LabelSession create a list of unconnected (data) nodes
# 2) Create an initial graph from the first list of data nodes by creating
#    a (match) node for each data node. The graph consists of a list of
#    match nodes plus edges to each data node.
# 3) Choose a second list of data nodes and attach to a match node where there
#    is overlap between the query data node and the match node. If there are
#    mulitple overlaps choose the one with the biggest overlap. Where there is
#    no overlap with any existing match node create a new match node and attach
#    the query data node.
# 4) Repeat for third and subsequent lists of data nodes. Where calculating
#    the overlap with a match node, compare to all attached data nodes and
#    choose the maximum overlap.

import json
import argparse
from graphql_client import GraphqlClient

class Node:
    ...

class DataNode(Node):
    def __init__(self, startTime, endTime, data, labeller_name):
        self.startTime = startTime
        self.endTime = endTime
        self.data = data
        self.labeller_name = labeller_name

    def __repr__(self):
        return f'DataNode: [{self.labeller_name}] startTime={self.startTime}, endTime={self.endTime} ({self.data["hand"]}, {self.data["punchType"]}, {self.data["punchQuality"]}, {self.data["target"]})'

    def toJson(self):
        return json.dumps(self, default=lambda o: o.__dict_)

class MatchNode(Node):
    def __init__(self, dataNode):
        self.intervals = [[dataNode.startTime, dataNode.endTime]]
        self.data_nodes = [dataNode]

    def get_start_time(self):
        start_time = min([dn.startTime for dn in self.data_nodes])
        return start_time
        

    def get_overlap(self, queryNode):
        max_overlap = 0
        queryStartTime = queryNode.startTime
        queryEndTime = queryNode.endTime
        for startTime, endTime in self.intervals:
            overlap = calculate_overlap(startTime, endTime, queryStartTime, queryEndTime)
            if overlap > max_overlap:
                max_overlap = overlap
        return max_overlap

    def add(self, dataNode):
        self.intervals.append([dataNode.startTime, dataNode.endTime])
        self.data_nodes.append(dataNode)

    def __repr__(self):
        ''' Return a string that outputs the `MatchNode:` followed by
            each attached data node indented'''
        match_node_string = '|-MatchNode\n'
        for dn in self.data_nodes:
            match_node_string += f'     |_{dn}\n'
        return match_node_string
            
def calculate_overlap(startTime, endTime, queryStartTime, queryEndTime):
    ''' There are 6 possible cases:
          1) ---- ____   query is completely after comparison
                           (overlap is 0)
          2) ____ ----   query is completely before comparison 
                           (overlap is 0)
          3) --------    query is completely contained in comparison
               ----        (overlap is length of query)
          4)    ----     comparison is completely contained in query
             ---------     (overlap is length of comparison)
          5)    -----    query starts before comparison and has some overlap
               ----        (overlap is queryEndTime - startTime)
          6) ----        comparison starts before query and has some overlap
               ----        (overlap is endTime - queryStartTime)
    '''
    if queryEndTime < startTime or queryStartTime > endTime: # cases 1 and 2
        return 0
    if queryStartTime >= startTime and queryEndTime <= endTime: # case 3
        return queryEndTime - queryStartTime    
    if startTime >= queryStartTime and endTime <= queryEndTime: # case 4
        return endTime - startTime
    if queryStartTime <= startTime: # case 5
        return queryEndTime - startTime
    if startTime <= queryStartTime: # case 6
        return endTime - queryStartTime
    assert f'calculate_overlap(startTime={startTime}, endTime={endTime}, queryStartTime={queryStartTime}, queryEndTime={queryEndTime})'

class Graph:
    def __init__(self):
        self.nodes = [] # contains a list of MatchNodes, not necessarily in time order

    def add(self, match_node):
        self.nodes.append(match_node)

    def print(self):
        if len(self.nodes) == 0:
            print('Empty Graph')
        else:
            print(self.nodes[0])
            for match_node in self.nodes[1:]:
                print('|')
                print(match_node)

    def punch_match_exceptions(self, labeller_names):
        exceptions = []
        num_labellers = len(labeller_names)
        for match_node in self.nodes:
            if len(match_node.data_nodes) < num_labellers:
                missing_labellers = set(labeller_names) - set([dn.labeller_name for dn in match_node.data_nodes])
                exceptions.append({
                    'exceptionType': 'MATCH_EXCEPTION',
                    'startTime': match_node.get_start_time(),
                    'missingLabellers': list(missing_labellers),
                    'matchNode': match_node})
        return exceptions
            

    def punch_attribute_exceptions(self):
        exceptions = []
        attribute_names = ['hand', 'punchType', 'punchQuality', 'target']
        for match_node in self.nodes:
            for attr_name in attribute_names:
                attribute_values = [dn.data[attr_name] for dn in match_node.data_nodes]
                if len(set(attribute_values)) > 1:
                    exceptions.append({
                        'exceptionType': 'ATTRIBUTE_EXCEPTION',
                        'startTime': match_node.get_start_time(),
                        'attrName': attr_name,
                        'matchNode': match_node
                    })
        return exceptions

    def toJson(self):
        return json.dumps(self, default=lambda o: o.__dict__)
        
def make_match_graph(data_list, labeller_names):
    match_graph = make_initial_match_graph(data_list, labeller_names)

    for data, labeller_name in zip(data_list[1:], labeller_names[1:]):
        add_data_to_graph(data, labeller_name, match_graph)
    
    return match_graph

def make_initial_match_graph(data_list, labeller_names):
    if len(data_list) < 1:
        raise SystemExit("There must be at least 1 dataset in order to create an initial match graph")

    data1 = data_list[0]
    labeller_name1 = labeller_names[0]    

    data_nodes1 = make_data_nodes(data1, labeller_name1)

    # create a graph from punch data list 1
    match_graph = Graph()
    for d in data_nodes1:
        match_node = MatchNode(d)
        match_graph.add(match_node)

    return match_graph

def add_data_to_graph(data, labeller_name, match_graph):
    data_nodes = make_data_nodes(data, labeller_name)

    for data_node in data_nodes:
        add_data_node_to_graph(data_node, match_graph)

def add_data_node_to_graph(dn, g):
    max_overlap = 0
    max_overlap_match_node = None
    for mn in g.nodes:
        overlap = mn.get_overlap(dn)
        if overlap > max_overlap:
            max_overlap = overlap
            max_overlap_match_node = mn
    if max_overlap > 0:
        max_overlap_match_node.add(dn)
    else:
        match_node = MatchNode(dn)
        g.add(match_node)

def make_data_nodes(data, labeller_name):
    data_nodes = [DataNode(d['startTime'], d['endTime'], d, labeller_name) for d in data]
    return data_nodes

def get_data(source_id):
    #endpoint = 'https://whhcgslnqbhknh5zqybbmsluou.appsync-api.us-east-1.amazonaws.com/graphql'
    #endpoint = 'https://zuqtjmfxabbi7jxo6gsxhk7wza.appsync-api.eu-west-2.amazonaws.com/graphql'
    endpoint = 'https://a3iieahk6ra6nlbelnhlikbjre.appsync-api.eu-west-2.amazonaws.com/graphql'
    #api_key = 'da2-zapwyty7hjh2tccygvm7m4kywi'
    #api_key = 'da2-22i2y2dbs5gm7lcbwvhgz5av4m'
    api_key = 'da2-3ovxlrstffaplgx3ffmmmssv2y'

    gq_client = GraphqlClient(
        endpoint=endpoint,
        headers={'x-api-key': api_key}
    )

    query = """
        query listLabelSessions {
          listLabelSessions(filter: {
				dataState: {eq: "final"},
                                sourceId: {eq: "SOURCE_ID"},
                            }
          ) {
            items {
              sourceId
              labellerName
              dateCreated
              labelData
              dataState
            }
          }
        }
        """.replace("SOURCE_ID", source_id)

    result = gq_client.execute(
    query=query,
        operation_name='listLabelSessions'
    )       
    result = json.loads(result)
    items = result['data']['listLabelSessions']['items']
    for ix,item in enumerate(items):
        items[ix]['labelData'] = json.loads(item['labelData'])
    return items

def print_label_session(ls):
    print(ls['sourceId'])
    print(ls['labellerName'])
    labelData = json.loads(ls['labelData'])
    print(type(labelData))
    print(type(labelData['boxer1']))
    print('boxer 1:')
    for punch in labelData['boxer1']['punches']:
        print(punch)
    print('boxer 2:')
    for punch in labelData['boxer2']['punches']:
        print(punch)
       

def get_dummy_data():
    data1 = {
        'sourceId': 'abc1',
        'labellerName': 'name1',
        'cratedAt': 'dummy time',
        'labelData': {
            'boxer1': {
                'punches': [
                	{
                        'startTime': 0.02,
                        'endTime': 0.22,
                        'hand': 'left',
                        'punchType': 'Straight',
                        'punchQuality': 'Missed',
                        'target': 'Body'
                	},
                	{
                        'startTime': 0.42,
                        'endTime': 0.82,
                        'hand': 'right',
                        'punchType': 'Straight',
                        'punchQuality': 'Missed',
                        'target': 'Body'
                	},
                        {
                        'startTime': 0.84,
                        'endTime': 1.22,
                        'hand': 'left',
                        'punchType': 'Straight',
                        'punchQuality': 'Missed',
                        'target': 'Body'
                	},
                	{
                        'startTime': 1.32,
                        'endTime': 1.64,
                        'hand': 'left',
                        'punchType': 'Straight',
                        'punchQuality': 'Missed',
                        'target': 'Body'
                	},
                        {
                        'startTime': 2.12,
                        'endTime': 2.42,
                        'hand': 'left',
                        'punchType': 'Straight',
                        'punchQuality': 'Missed',
                        'target': 'Body'
                	}
                    ]
                },
            'boxer2': {
                'punches': [
                	{
                        'startTime': 0.02,
                        'endTime': 0.22,
                        'hand': 'left',
                        'punchType': 'Straight',
                        'punchQuality': 'Missed',
                        'target': 'Body'
                	},
                	{
                        'startTime': 0.42,
                        'endTime': 0.82,
                        'hand': 'left',
                        'punchType': 'Straight',
                        'punchQuality': 'Missed',
                        'target': 'Body'
                	},
                        {
                        'startTime': 0.84,
                        'endTime': 1.22,
                        'hand': 'left',
                        'punchType': 'Straight',
                        'punchQuality': 'Missed',
                        'target': 'Body'
                	},
                	{
                        'startTime': 1.32,
                        'endTime': 1.64,
                        'hand': 'left',
                        'punchType': 'Straight',
                        'punchQuality': 'Missed',
                        'target': 'Body'
                	},
                        {
                        'startTime': 2.12,
                        'endTime': 2.42,
                        'hand': 'left',
                        'punchType': 'Straight',
                        'punchQuality': 'Missed',
                        'target': 'Body'
                	}
                    ]
                }
        }
    }

    data2 = {
        'sourceId': 'abc2',
        'labellerName': 'name2',
        'cratedAt': 'dummy time',
        'labelData': {
            'boxer1': {
                'punches': [
                	{
                        'startTime': 0.02,
                        'endTime': 0.22,
                        'hand': 'left',
                        'punchType': 'Straight',
                        'punchQuality': 'Missed',
                        'target': 'Body'
                	},
                	{
                        'startTime': 0.32,
                        'endTime': 0.90,
                        'hand': 'left',
                        'punchType': 'Straight',
                        'punchQuality': 'Missed',
                        'target': 'Body'
                	},
                        {
                        'startTime': 1.12,
                        'endTime': 1.52,
                        'hand': 'left',
                        'punchType': 'Straight',
                        'punchQuality': 'Missed',
                        'target': 'Body'
                	},
                	{
                        'startTime': 2.52,
                        'endTime': 2.8,
                        'hand': 'left',
                        'punchType': 'Straight',
                        'punchQuality': 'Missed',
                        'target': 'Body'
                	}
                 ]
                },
            'boxer2': {
                'punches': [
                	{
                        'startTime': 0.02,
                        'endTime': 0.22,
                        'hand': 'left',
                        'punchType': 'Straight',
                        'punchQuality': 'Missed',
                        'target': 'Body'
                	},
                	{
                        'startTime': 0.32,
                        'endTime': 0.90,
                        'hand': 'left',
                        'punchType': 'Straight',
                        'punchQuality': 'Missed',
                        'target': 'Body'
                	},
                        {
                        'startTime': 1.12,
                        'endTime': 1.52,
                        'hand': 'left',
                        'punchType': 'Straight',
                        'punchQuality': 'Missed',
                        'target': 'Body'
                	},
                	{
                        'startTime': 2.52,
                        'endTime': 2.8,
                        'hand': 'left',
                        'punchType': 'Straight',
                        'punchQuality': 'Missed',
                        'target': 'Body'
                	}
                 ]
                }
        }
    }

    data3 = {
        'sourceId': 'abc3',
        'labellerName': 'name3',
        'cratedAt': 'dummy time',
        'labelData': {
            'boxer1': {
                'punches': [
                	{
                        'startTime': 0.02,
                        'endTime': 0.22,
                        'hand': 'left',
                        'punchType': 'Straight',
                        'punchQuality': 'Missed',
                        'target': 'Body'
                	},
                	{
                        'startTime': 0.28,
                        'endTime': 0.72,
                        'hand': 'left',
                        'punchType': 'Straight',
                        'punchQuality': 'Missed',
                        'target': 'Body'
                	},
                	{
                        'startTime': 0.74,
                        'endTime': 1.28,
                        'hand': 'left',
                        'punchType': 'Straight',
                        'punchQuality': 'Missed',
                        'target': 'Body'
                	},
                        {
                        'startTime': 1.32,
                        'endTime': 1.72,
                        'hand': 'left',
                        'punchType': 'Straight',
                        'punchQuality': 'Missed',
                        'target': 'Body'
                	},
                	{
                        'startTime': 2.12,
                        'endTime': 2.56,
                        'hand': 'left',
                        'punchType': 'Straight',
                        'punchQuality': 'Missed',
                        'target': 'Body'
                	},
                        {
                        'startTime': 2.58,
                        'endTime': 2.86,
                        'hand': 'left',
                        'punchType': 'Straight',
                        'punchQuality': 'Missed',
                        'target': 'Body'
                	}
                   ]
                },
            'boxer2': {
                'punches': [
                	{
                        'startTime': 0.02,
                        'endTime': 0.22,
                        'hand': 'left',
                        'punchType': 'Straight',
                        'punchQuality': 'Missed',
                        'target': 'Body'
                	},
                	{
                        'startTime': 0.28,
                        'endTime': 0.72,
                        'hand': 'left',
                        'punchType': 'Straight',
                        'punchQuality': 'Missed',
                        'target': 'Body'
                	},
                	{
                        'startTime': 0.74,
                        'endTime': 1.28,
                        'hand': 'left',
                        'punchType': 'Straight',
                        'punchQuality': 'Missed',
                        'target': 'Head'
                	},
                        {
                        'startTime': 1.32,
                        'endTime': 1.72,
                        'hand': 'left',
                        'punchType': 'Straight',
                        'punchQuality': '1',
                        'target': 'Body'
                	},
                	{
                        'startTime': 2.12,
                        'endTime': 2.56,
                        'hand': 'left',
                        'punchType': 'Uppercut',
                        'punchQuality': 'Missed',
                        'target': 'Body'
                	},
                        {
                        'startTime': 2.58,
                        'endTime': 2.90,
                        'hand': 'left',
                        'punchType': 'Straight',
                        'punchQuality': 'Missed',
                        'target': 'Body'
                	}
                 ]
            }
        }
    }
    
    return [data1, data2, data3]

# Function to be used with json.dumps()'s default argument
def my_encoder(obj):
    if isinstance(obj, DataNode):
        return obj.__dict__  # Return the __dict__ attribute
    if isinstance(obj, MatchNode):
        # Create a copy of obj.__dict__ to avoid modifying the original object
        serializable_dict = obj.__dict__.copy()
        # Remove the 'name' attribute from the dictionary
        serializable_dict.pop('intervals', None)  # Use pop to avoid KeyError if 'name' doesn't exist
        return serializable_dict
    raise TypeError(f"Object of type {obj.__class__.__name__} is not JSON serializable")

def parse_args():
    description = \
'''
This utility reads punch data from the LabelSession DynamoDB table, and looks for\n 
differences across each labeller. The output files "boxer1.json" and "boxer2.json"\n
can be loaded into the Exceptions Reporting view of the BRL Labeller app.
'''

    parser = argparse.ArgumentParser(description=description)
    parser.add_argument('sourceId', help='The VideoDataSource sourceId to read from DynamoDB')
    return parser.parse_args()

if __name__ == '__main__':
    args = parse_args()
    source_id = args.sourceId

    #data_list = get_dummy_data()
    data_list = get_data(source_id=source_id)
  
    boxers = {'boxer1': 'Boxer 1', 'boxer2': 'Boxer 2'}
    for boxer in boxers:
        boxer_name = boxers[boxer] 
        data_list_boxer = [data['labelData'][boxer]['punches'] for data in data_list]
        labeller_names = [data['labellerName'] for data in data_list]
        match_graph = make_match_graph(data_list_boxer, labeller_names) 
        print(f'{boxer_name}\n---------')
        match_graph.print()
        match_exceptions = match_graph.punch_match_exceptions(labeller_names)
        attribute_exceptions = match_graph.punch_attribute_exceptions()
        exceptions = [*match_exceptions, *attribute_exceptions]
        exceptions = sorted(exceptions, key=lambda exception: exception['startTime'])
        with open(f'{boxer}.json', 'w') as jsonout:
            json.dump(exceptions, jsonout, default=my_encoder, indent=2)
