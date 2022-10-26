import axios from "axios"

interface PlaybackParameters {
    device_id: string; position_ms: number; headers: any; context_uri?: string; uris?: string[]; offset?: any; 
}

export function startPlayback({device_id, position_ms, headers, context_uri, uris, offset} : PlaybackParameters): void {

    axios.put("https://api.spotify.com/v1/me/player/play",
    {...(context_uri ? {context_uri: context_uri} : {}),...(uris ? {uris: uris} : {}),...(offset ? {offset: offset} : {}), position_ms: position_ms},
    {headers:  headers,
    params:{device_id: device_id}},
    ).then((response) => {
      return;  
    }).catch((error) => {
        return;
    })
  
}