import axios, { Canceler } from "axios";
import { useEffect, useState, useMemo } from "react"
import { PlaylistInterface} from "../Types/SpotifyApi";

export default function usePlaylistLoad(setPlaylists: React.Dispatch<React.SetStateAction<PlaylistInterface[]>>, offset: number, limit: number, headers: any, userId: string, curPlaylist: PlaylistInterface, update: number, snapshot_id?: string) {

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [tracks, setTracks] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [refresh, setRefresh] = useState<number>(0);

  const url = useMemo(() => {
    return curPlaylist.id !== "" ? `https://api.spotify.com/v1/playlists/${curPlaylist.id}/tracks`:`https://api.spotify.com/v1/me/playlists`;
  },[curPlaylist.id])

  // TODO: add liked song info
  // TODO: add loading indicator for tracks
  // TODO: update tracks.tracks => tracks (Playlist.tsx)


  useEffect(() => {
    setPlaylists([])
    setTracks([]);
    setLoading(true);
    setError(false);
    setHasMore(true);
    setRefresh(refresh => refresh + 1);
  }, [update, setPlaylists])
 
  useEffect(() => {
    if (curPlaylist.id === "") return;
    if (snapshot_id && snapshot_id === "") return; 
    
    setTracks([]);
    setPlaylists([]);
    
    setLoading(true);
    setError(false);
    setHasMore(true);
  },[curPlaylist.id, snapshot_id, setPlaylists])

  useEffect(() => {
    if (userId === "") return;
    if (!loading && !hasMore) return;
    setLoading(true);
    setError(false);
    let cancel: Canceler;

    axios.get(url, {
      params: {limit: limit, offset: offset},
      headers: headers,
      cancelToken: new axios.CancelToken(c => cancel = c)
    }).then((response) => {

      if (curPlaylist.id !== "") {
        console.log(response);
        setTracks(prevTracks => {return [...prevTracks, ...response.data.items]})
      } else {
        let result: any[] = [];
        console.log(response.data.items);
        for (const playlist of response.data.items) {
          if (playlist.owner.id === userId) {
            result.push(playlist);
          }
        }
        setPlaylists(prevPlaylists => {return [...prevPlaylists, ...result]})
      }
      
      setHasMore(response.data.next !== null);
      setLoading(false);
    }).catch((error) => {
      if (axios.isCancel(error)) return;
      setError(true);
    })

    return () => cancel();
    // eslint-disable-next-line
  },[offset, curPlaylist, userId, headers, limit, url, setPlaylists, refresh])


  return {loading, error, tracks, hasMore}
}

