/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const updateLabelSessionPunches = /* GraphQL */ `
  mutation UpdateLabelSessionPunches(
    $dateCreated: AWSDateTime!
    $labelData: AWSJSON
    $sourceId: ID!
    $zoomData: AWSJSON
  ) {
    updateLabelSessionPunches(
      dateCreated: $dateCreated
      labelData: $labelData
      sourceId: $sourceId
      zoomData: $zoomData
    ) {
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
export const updateLabelSessionState = /* GraphQL */ `
  mutation UpdateLabelSessionState(
    $dataState: String
    $dateCreated: AWSDateTime!
    $sourceId: ID!
  ) {
    updateLabelSessionState(
      dataState: $dataState
      dateCreated: $dateCreated
      sourceId: $sourceId
    ) {
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
export const createLabelSession = /* GraphQL */ `
  mutation CreateLabelSession(
    $input: CreateLabelSessionInput!
    $condition: ModelLabelSessionConditionInput
  ) {
    createLabelSession(input: $input, condition: $condition) {
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
export const updateLabelSession = /* GraphQL */ `
  mutation UpdateLabelSession(
    $input: UpdateLabelSessionInput!
    $condition: ModelLabelSessionConditionInput
  ) {
    updateLabelSession(input: $input, condition: $condition) {
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
export const deleteLabelSession = /* GraphQL */ `
  mutation DeleteLabelSession(
    $input: DeleteLabelSessionInput!
    $condition: ModelLabelSessionConditionInput
  ) {
    deleteLabelSession(input: $input, condition: $condition) {
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
export const createVideoDataSource = /* GraphQL */ `
  mutation CreateVideoDataSource(
    $input: CreateVideoDataSourceInput!
    $condition: ModelVideoDataSourceConditionInput
  ) {
    createVideoDataSource(input: $input, condition: $condition) {
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
export const updateVideoDataSource = /* GraphQL */ `
  mutation UpdateVideoDataSource(
    $input: UpdateVideoDataSourceInput!
    $condition: ModelVideoDataSourceConditionInput
  ) {
    updateVideoDataSource(input: $input, condition: $condition) {
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
export const deleteVideoDataSource = /* GraphQL */ `
  mutation DeleteVideoDataSource(
    $input: DeleteVideoDataSourceInput!
    $condition: ModelVideoDataSourceConditionInput
  ) {
    deleteVideoDataSource(input: $input, condition: $condition) {
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
