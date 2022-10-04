import { useEffect, useState } from "react";

interface HistoryParameters {
    current_track?: any, recommended_tracks?: any[]
}
export default function useHistory({current_track, recommended_tracks} : HistoryParameters): void {
    const maxLength = 100;
    const changedEvent = new Event("changed");
    useEffect(() => {

        if (!localStorage.getItem("history")) 
            localStorage.setItem("history", JSON.stringify([]));

        let localHistory = localStorage.getItem("history") ? JSON.parse(localStorage.getItem("history")!) : []

        if (current_track && current_track.name !== "") {
            
            if (!localHistory.some((track: any) => track.uri === current_track.uri)) addToHistory([current_track])
        }

    },[current_track])

    useEffect(() => {

        if (!localStorage.getItem("history")) 
            localStorage.setItem("history", JSON.stringify([]));

        let localHistory = localStorage.getItem("history") ? JSON.parse(localStorage.getItem("history")!) : []

        if (recommended_tracks && typeof recommended_tracks !== "undefined" && recommended_tracks.length > 0) {
            let newTracks = [];
          
            for (let i = 0; i < recommended_tracks.length; i++) {
                if (!localHistory.some((track: any) => track.uri === recommended_tracks[i].uri)) newTracks.push(recommended_tracks[i]);
            }

            addToHistory(newTracks);
        } 
    },[recommended_tracks])

    const addToHistory = (track: any[]) => {  

        let localHistory = localStorage.getItem("history") ? JSON.parse(localStorage.getItem("history")!) : []
        if (localHistory.length + track.length > maxLength) 
            localHistory.splice(0, track.length);
        
        localHistory = localHistory.concat(track);
        localStorage.setItem("history", JSON.stringify(localHistory));
        dispatchEvent(changedEvent);
        
    }

   
}