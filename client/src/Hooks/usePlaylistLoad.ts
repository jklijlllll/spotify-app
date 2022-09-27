import axios, { Canceler } from "axios";
import { useEffect, useState } from "react"

export default function usePlaylistLoad(offset: number, limit: number, headers: any, userId: string, playlistId: string) {

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(false);

  const url = playlistId ? `https://api.spotify.com/v1/playlists/${playlistId}/tracks`:`https://api.spotify.com/v1/me/playlists` 

  useEffect(() => {
    setPlaylists([])
    setTracks([]);
  }, [])

  useEffect(() => {
    if (playlistId === "") {
      setTracks([]);
    } else {
      setPlaylists([]);
    }
    setLoading(true);
    setError(false);
    setHasMore(true);
  },[playlistId])

  useEffect(() => {
    setLoading(true);
    setError(false);
    let cancel: Canceler;

    axios.get(url, {
      params: {limit: limit, offset: offset},
      headers: headers,
      cancelToken: new axios.CancelToken(c => cancel = c)
    }).then((response) => {

      if (playlistId) {
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
  },[offset, playlistId])

  return {loading, error, playlists, tracks, hasMore}
}
