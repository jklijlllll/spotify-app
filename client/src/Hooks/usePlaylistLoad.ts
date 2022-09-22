import axios, { Canceler } from "axios";
import { useEffect, useState } from "react"


export default function usePlaylistLoad(offset: number, limit: number, headers: any, query?: string,) {

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(false);

  useEffect(() => {
    setPlaylists([])
  }, [query])

  useEffect(() => {
    setLoading(true);
    setError(false);
    let cancel: Canceler;

    axios.get(`https://api.spotify.com/v1/me/playlists`, {
      params: {limit: limit, offset: offset},
      headers: headers,
      cancelToken: new axios.CancelToken(c => cancel = c)
    }).then((response) => {
      console.log(response.data.items);
      setPlaylists(prevPlaylists => {return [...prevPlaylists, ...response.data.items]})
      setHasMore(response.data.next !== null);
      setLoading(false);
    }).catch((error) => {
      if (axios.isCancel(error)) return;
      setError(true);
    })

    return () => cancel();
  },[query, offset])

  return {loading, error, playlists, hasMore}
}
