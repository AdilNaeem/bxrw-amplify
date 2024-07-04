import React, { useEffect, useRef, useState } from 'react';
import { Amplify } from 'aws-amplify';
import amplifyconfig from '../amplifyconfiguration.json';
Amplify.configure(amplifyconfig);
import { generateClient } from 'aws-amplify/api';
import { createLabelSession as createLabelSessionMutation } from '../graphql/mutations';
import { updateLabelSessionState as updateLabelSessionStateMutation } from '../graphql/mutations';
import { updateLabelSessionPunches as updateLabelSessionPunchesMutation } from '../graphql/mutations';
import MultiVideoContainer from './MultiVideoContainer';
import PunchDataTable from './PunchDataTable';
import InfoBox2 from './InfoBox2';
import { PunchList } from '../lib/punchlist';
import { ZoomData } from '../lib/zoomdata';
import useKeyboardShortcut from 'use-keyboard-shortcut';
import { videoTimeToFrameCount, timeCodeFromFrameCount } from '../lib/time';

const MINUTE_MS = 60000;

const client = generateClient();

const zoomData = new ZoomData();
const punchData = {boxer1: new PunchList(), boxer2: new PunchList()};

const initialPunchMetaData = {
    hand: "<empty>",
    punchType: "<empty>",
    punchQuality: "<empty>",
    target: "<empty>",
    knockdown: false,
    footOffGround: false};
 
const LabellingScreen = ({selectedDataSource, username, finishLabelling}) => {
    const {source_urls, ...header_info} = selectedDataSource;
    const { fps } = header_info;

    const [selectedBoxer, setSelectedBoxer] = useState("boxer1");
    const [punchStatus, setPunchStatus] = useState({
                                            hasOpenPunch: false, 
                                            hasPunchAt: false, 
                                            canClosePunchAt: false,
                                            punch: null});
    const [punchMetaData, setPunchMetaData] = useState(initialPunchMetaData)
    const [timeCode, setTimeCode] = useState(0.0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [labelSessionDateCreated, setLabelSessionDateCreated] = useState(null);

    const videoRef = useRef(null);

    // Create a LabelSession
    useEffect(() => {
        createLabelSession('started');
    }, []);

    // Update data every 1 minute
    useEffect(() => {
        const interval = setInterval(() => {
            updateLabelSessionState('interim');
            updateLabelSessionPunches();
        }, MINUTE_MS);
    
        return () => clearInterval(interval); 
    }, [labelSessionDateCreated]);

    // Keyboard short-cuts START
    const defaultKbShortcutOptions = { 
        overrideSystem: false,
        ignoreInputFields: false, 
        repeatOnHold: false 
    };
    useKeyboardShortcut(
        ["p"],
        shortcutKeys => {
            if (!startPunchDisabled) startPunch();
            if (!endPunchDisabled) endPunch();
        },
        defaultKbShortcutOptions
    );
    useKeyboardShortcut(
        ["Control", "S"],
        shortcutKeys => {
            dumpState();
        },
        defaultKbShortcutOptions
    );

    function dumpState() {
        console.log(punchData);
    }
    // Keyboard short-cuts END

    const boxerName = selectedBoxer === 'boxer1' ? header_info.boxer1 : header_info.boxer2;
    const boxerNames = [header_info.boxer1, header_info.boxer2];

    const changeSelectedBoxer = (boxerName) => {
        setSelectedBoxer(boxerName);
        const selectedPunchData = punchData[boxerName];
        const {hand, punchType, punchQuality, target, knockdown, footOffGround} = 
            selectedPunchData.hasPunchAt(timeCode) ? selectedPunchData.getPunchAt(timeCode) : initialPunchMetaData;
        updatePunchStatus(selectedPunchData, timeCode);
        setPunchMetaData(prevState => ({
            hand: hand,
            punchType: punchType,
            punchQuality: punchQuality,
            target: target,
            knockdown: knockdown,
            footOffGround: footOffGround
          }));
    }

    const changeTimeCode = (newTimeCode) => {
        setTimeCode(newTimeCode);
        const selectedPunchData = punchData[selectedBoxer];
        const {hand, punchType, punchQuality, target, knockdown, footOffGround} = 
            selectedPunchData.hasPunchAt(newTimeCode) ? selectedPunchData.getPunchAt(newTimeCode) : initialPunchMetaData;
        updatePunchStatus(selectedPunchData, newTimeCode);
        setPunchMetaData(prevState => ({
            hand: hand,
            punchType: punchType,
            punchQuality: punchQuality,
            target: target,
            knockdown: knockdown,
            footOffGround: footOffGround
          }));
    }

    const changePunchMetaData = (newMetaData) => {
        const {hand, punchType, punchQuality, target, knockdown, footOffGround} = newMetaData;
        const selectedPunchData = punchData[selectedBoxer];
        var currentPunch = selectedPunchData.getPunchAt(timeCode);
        currentPunch.hand = hand;
        currentPunch.punchType = punchType;
        currentPunch.punchQuality = punchQuality;
        currentPunch.target = target;
        currentPunch.knockdown = knockdown;
        currentPunch.footOffGround = footOffGround;
        setPunchMetaData(prevState => ({
            hand: hand,
            punchType: punchType,
            punchQuality: punchQuality,
            target: target,
            knockdown: knockdown,
            footOffGround: footOffGround
          }));
    }
    
    function updatePunchStatus(selectedPunchData, withTimeCode) {
        setPunchStatus({
            hasOpenPunch: selectedPunchData.hasOpenPunch,
            hasPunchAt: selectedPunchData.hasPunchAt(withTimeCode),
            canClosePunchAt: selectedPunchData.canClosePunchAt(withTimeCode),
            punch: selectedPunchData.getPunchAt(withTimeCode)
        });
    }

    const addFeint = (event) => {
        const selectedPunchData = punchData[selectedBoxer];
        selectedPunchData.addFeint(timeCode);
        updatePunchStatus(selectedPunchData, timeCode);
    }

    const startPunch = (event) => {
        const selectedPunchData = punchData[selectedBoxer];
        selectedPunchData.addPunch(timeCode);
        updatePunchStatus(selectedPunchData, timeCode);
    }

    const endPunch = (event) => {
        const selectedPunchData = punchData[selectedBoxer];
        selectedPunchData.closePunch(timeCode);
        updatePunchStatus(selectedPunchData, timeCode);
    }

    const deletePunch = (event) => {
        const selectedPunchData = punchData[selectedBoxer];
        selectedPunchData.deletePunchAt(timeCode);
        updatePunchStatus(selectedPunchData, timeCode);
    }

    const savePunches = (event) => {
        const userConfirmed = window.confirm("Are you sure you want to finish this session?");

        if (userConfirmed) {
            updateLabelSessionState('final');
            updateLabelSessionPunches();
            punchData['boxer1'] = new PunchList();
            punchData['boxer2'] = new PunchList();
            finishLabelling();    
        }
    }

    async function createLabelSession(dataState) {
        const dateCreated = labelSessionDateCreated ?? new Date().toJSON();

        const data = {
          sourceId: header_info.id,
          labellerName: username,
          dateCreated: dateCreated,
          labelData: JSON.stringify(punchData),
          zoomData: JSON.stringify(zoomData),
          dataState: dataState,
        };
       
        const response = await client.graphql({
          query: createLabelSessionMutation,
          variables: { input: data },
        });

        // set the dateCreated state variable which is part of the primary key (sourceId, dateCreated)
        setLabelSessionDateCreated(response["data"]["createLabelSession"]["dateCreated"]);
    }

    async function updateLabelSessionState(dataState) {
        const dateCreated = labelSessionDateCreated;

        const response = await client.graphql({
          query: updateLabelSessionStateMutation,
          variables: { sourceId: header_info.id, dateCreated: dateCreated, dataState: dataState },
        });
    }

    async function updateLabelSessionPunches() {
        const dateCreated = labelSessionDateCreated;

        const response = await client.graphql({
          query: updateLabelSessionPunchesMutation,
          variables: { 
            sourceId: header_info.id, 
            dateCreated: dateCreated, 
            labelData: JSON.stringify(punchData),
            zoomData: JSON.stringify(zoomData)
         },
        });
    }

    const feintDisabled = punchStatus.hasPunchAt || punchStatus.hasOpenPunch || isPlaying;
    const startPunchDisabled = punchStatus.hasOpenPunch || punchStatus.hasPunchAt || isPlaying;
    const endPunchDisabled = !punchStatus.canClosePunchAt || isPlaying;
    const deletePunchDisabled = !punchStatus.hasPunchAt || isPlaying;
    const savePunchesDisabled = false;


    const punchButtonNames = ['Feint', 'Start Punch', 'End Punch', 'Finish'];
    const punchBehaviour = [addFeint, startPunch, endPunch, savePunches];
    const punchDisabled = [feintDisabled, startPunchDisabled, endPunchDisabled, savePunchesDisabled];

    const punchButtonInfo = punchButtonNames.map ((name, index) =>
        ({
            'name': name,
            'behaviour': punchBehaviour[index],
            'disabled': punchDisabled[index]
        })
    );

    if (!source_urls) {
        return (
            <div></div>
        )
    }

    return (
        <>
        <div className='video-info-box-container'>
            <div className='video-view'>
                <MultiVideoContainer 
                    urls={source_urls}
                    fps={fps}
                    timeCode={timeCode}
                    cbTimeCode={changeTimeCode}
                    isPlaying={isPlaying}
                    setIsPlaying={setIsPlaying}
                    additionalButtonInfo={punchButtonInfo}
                    videoRef={videoRef}
                    zoomData={zoomData} />
                <div className='punch-data-tables-container'>
                    <PunchDataTable 
                        punchData={punchData['boxer1']['punches']} 
                        prefix='boxer1'
                        cbTimeCode={changeTimeCode}
                        changeSelectedBoxer={changeSelectedBoxer}
                        videoRef={videoRef} />
                    <PunchDataTable 
                        punchData={punchData['boxer2']['punches']} 
                        prefix='boxer2'
                        cbTimeCode={changeTimeCode}
                        changeSelectedBoxer={changeSelectedBoxer}
                        videoRef={videoRef} />
                </div>
                
            </div>
            <InfoBox2 
                selectedBoxer={selectedBoxer}
                changeSelectedBoxer={changeSelectedBoxer}
                boxerNames={boxerNames}
                punch={punchStatus.punch}
                punchMetaData={punchMetaData}
                setPunchMetaData={changePunchMetaData}
                deletePunchInfo={{'punchDisabled': deletePunchDisabled, 'punchBehaviour': deletePunch}} /> 
        </div>
        
        </>  
    );
};
 
export default LabellingScreen;
