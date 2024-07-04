/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateLabelSession = /* GraphQL */ `
  subscription OnCreateLabelSession(
    $filter: ModelSubscriptionLabelSessionFilterInput
  ) {
    onCreateLabelSession(filter: $filter) {
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
export const onUpdateLabelSession = /* GraphQL */ `
  subscription OnUpdateLabelSession(
    $filter: ModelSubscriptionLabelSessionFilterInput
  ) {
    onUpdateLabelSession(filter: $filter) {
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
export const onDeleteLabelSession = /* GraphQL */ `
  subscription OnDeleteLabelSession(
    $filter: ModelSubscriptionLabelSessionFilterInput
  ) {
    onDeleteLabelSession(filter: $filter) {
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
export const onCreateVideoDataSource = /* GraphQL */ `
  subscription OnCreateVideoDataSource(
    $filter: ModelSubscriptionVideoDataSourceFilterInput
  ) {
    onCreateVideoDataSource(filter: $filter) {
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
export const onUpdateVideoDataSource = /* GraphQL */ `
  subscription OnUpdateVideoDataSource(
    $filter: ModelSubscriptionVideoDataSourceFilterInput
  ) {
    onUpdateVideoDataSource(filter: $filter) {
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
export const onDeleteVideoDataSource = /* GraphQL */ `
  subscription OnDeleteVideoDataSource(
    $filter: ModelSubscriptionVideoDataSourceFilterInput
  ) {
    onDeleteVideoDataSource(filter: $filter) {
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
