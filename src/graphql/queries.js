/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getLabelSession = /* GraphQL */ `
  query GetLabelSession($sourceId: ID!, $dateCreated: AWSDateTime!) {
    getLabelSession(sourceId: $sourceId, dateCreated: $dateCreated) {
      dataState
      dateCreated
      labelData
      labellerName
      sourceId
      zoomData
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listLabelSessions = /* GraphQL */ `
  query ListLabelSessions(
    $sourceId: ID
    $dateCreated: ModelStringKeyConditionInput
    $filter: ModelLabelSessionFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listLabelSessions(
      sourceId: $sourceId
      dateCreated: $dateCreated
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        dataState
        dateCreated
        labelData
        labellerName
        sourceId
        zoomData
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getVideoDataSource = /* GraphQL */ `
  query GetVideoDataSource($id: ID!) {
    getVideoDataSource(id: $id) {
      boxer1
      boxer2
      date
      description
      fps
      id
      location
      num_camera_views
      round
      segment
      assigned_labellers
      source_urls
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listVideoDataSources = /* GraphQL */ `
  query ListVideoDataSources(
    $filter: ModelVideoDataSourceFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listVideoDataSources(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        boxer1
        boxer2
        date
        description
        fps
        id
        location
        num_camera_views
        round
        segment
        assigned_labellers
        source_urls
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
