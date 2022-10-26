import axios, { Canceler } from "axios";
import { useEffect, useState, useMemo } from "react"
import { PlaylistInterface} from "../Types/SpotifyApi";

export default function usePlaylistLoad(setPlaylists: React.Dispatch<React.SetStateAction<PlaylistInterface[]>>, offset: number, limit: number, headers: any, userId: string, curPlaylist: PlaylistInterface, update: number, setLiked: React.Dispatch<React.SetStateAction<boolean[]>>, snapshot_id?: string) {

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [tracks, setTracks] = useState<any[]>([]);
  
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [refresh, setRefresh] = useState<number>(0);

  const url = useMemo(() => {
    return curPlaylist.id !== "" ? `https://api.spotify.com/v1/playlists/${curPlaylist.id}/tracks`:`https://api.spotify.com/v1/me/playlists`;
  },[curPlaylist.id])

  useEffect(() => {
    setPlaylists([])
    setTracks([]);
    setLiked([]);

    setLoading(true);
    setError(false);
    setHasMore(true);
    setRefresh(refresh => refresh + 1);
  }, [update, setPlaylists, setLiked])
 
  useEffect(() => {
    if (curPlaylist.id === "") return;
    if (snapshot_id && snapshot_id === "") return; 
    
    setTracks([]);
    setPlaylists([]);
    setLiked([]);
    
    setLoading(true);
    setError(false);
    setHasMore(true);
    
  },[curPlaylist.id, snapshot_id, setPlaylists, setLiked])

  useEffect(() => {
    
    setLoading(true);
    setError(false);
    let cancel: Canceler;

    axios.get(url, {
      params: {limit: limit, offset: offset},
      headers: headers,
      cancelToken: new axios.CancelToken(c => cancel = c)
    }).then((response) => {

      if (curPlaylist.id !== "") {
        console.log(response.data.items); 

        let ids = response.data.items.reduce((previous: any, current: any) => {return previous + current.track.id + ","}, "");
        ids = ids.replace(/,\s*$/, "");

        return axios.get("https://api.spotify.com/v1/me/tracks/contains", {
          params: {ids: ids},
          headers: headers,
          cancelToken: new axios.CancelToken(c => cancel = c)
        }).then((likedResponse) => {
          setTracks(prevTracks => {return [...prevTracks, ...response.data.items]});
          setLiked(prevLiked => {return [...prevLiked, ...likedResponse.data]});
          setHasMore(response.data.next !== null);
          setLoading(false);
        }).catch((error) => {
          if (axios.isCancel(error)) return;
          setError(true);
        })

        
      } else {
        let result: any[] = [];
        console.log(response.data.items);
        for (const playlist of response.data.items) {
          if (playlist.owner.id === userId) {
            result.push(playlist);
          }
        }
        setPlaylists(prevPlaylists => {return [...prevPlaylists, ...result]});
        setHasMore(response.data.next !== null);
        setLoading(false);
      }
      
      
    }).catch((error) => {
      if (axios.isCancel(error)) return;
      setError(true);
    })

    return () => cancel();
    // eslint-disable-next-line
  },[offset, refresh, curPlaylist])


  return {loading, error, tracks, hasMore}
}

