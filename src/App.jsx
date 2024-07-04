import { useState, useEffect } from 'react'
import './App.css'
import { Amplify } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import amplifyconfig from './amplifyconfiguration.json';
Amplify.configure(amplifyconfig);
import { generateClient } from 'aws-amplify/api';
import { listVideoDataSources } from './graphql/queries';
import LabellingScreen from './components/LabellingScreen';
import useKeyboardShortcut from 'use-keyboard-shortcut';
import PunchExceptionScreen from './components/PunchExceptionScreen';
import { VideoDataSourceListScreen } from './components/VideoDataSourceListScreen';
import { getCurrentUser } from 'aws-amplify/auth';

const client = generateClient();

function App({ signOut, user }) {
  const [dataSources, setDataSources] = useState([]);
  const [selectedDataSource, setSelectedDataSource] = useState(null);
  const [showExceptionsScreen, setShowExceptionsScreen] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Keyboard short-cuts START
  const defaultKbShortcutOptions = { 
    overrideSystem: false,
    ignoreInputFields: false, 
    repeatOnHold: false 
};
useKeyboardShortcut(
    ["Control", "U"],
    shortcutKeys => {
        setShowExceptionsScreen(!showExceptionsScreen);
    },
    defaultKbShortcutOptions
);
// Keyboard short-cuts END

  useEffect(() => {
    fetchDataSources();
  }, []);

  async function fetchDataSources() {
    var allItems = [];

    // Iterate through VideoDataSource table
    //var nToken = undefined;
    do {
      const batchData = await client.graphql( { 
        query: listVideoDataSources,
        variables: {
          limit: 200,
          nextToken: nToken
        } });
      var { items, nextToken: nToken } = batchData.data.listVideoDataSources;
      console.log(items);
      console.log(nToken);
      allItems = [...allItems, ...items];
    } while(nToken);
    

    try {
      const { username, userId, signInDetails } = await getCurrentUser();
      console.log(`username: ${username}, userId: ${userId}, signInDetails: ${JSON.stringify(signInDetails)}`);
      
      // only show records where `assigned_labellers` contains the logged in username
      let sortedDs = allItems.
          toSorted(function(a,b) {
            return a.description < b.description ? -1 :
                    a.description > b.description ? 1 :
                  a.round < b.round ? -1 :
                  a.round > b.round  ? 1 : 0})
      let filteredDs = sortedDs.filter(record => record.assigned_labellers && record.assigned_labellers.includes(username));
      setDataSources(
        filteredDs
      );
      setErrorMessage(null);
    } catch(exception) {
      console.log('error fetching data sources');
      console.log(exception.errors);
      setErrorMessage(JSON.stringify(exception.errors[0]));
    }
    
  }



  const listScreen = (
    <VideoDataSourceListScreen 
      dataSources={dataSources}
      selectedDataSource={selectedDataSource}
      setSelectedDataSource={setSelectedDataSource}
      errorMessage={errorMessage}
      signOut={signOut}
    />
  );

  return (
      <div className="app">
        <div className="app-body">
          {showExceptionsScreen ? (
            <div>
              <PunchExceptionScreen 
                selectedDataSource={selectedDataSource}
                exitScreen={setShowExceptionsScreen} />
            </div>
            ):
            selectedDataSource === null ? listScreen : (
            <div id="labellingScreen">
              <LabellingScreen 
                key={selectedDataSource.round} 
                selectedDataSource={selectedDataSource} 
                username={user.username}
                finishLabelling={() => setSelectedDataSource(null)} />
             </div>
          )}

        </div>
      </div>
  )
}

const withAuthenticatorOptions = {
  hideSignUp: true
}

export default withAuthenticator(App, withAuthenticatorOptions);