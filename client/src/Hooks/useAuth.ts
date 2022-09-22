import { useState, useEffect } from "react";
import axios from "axios";

export default function useAuth(code: string) {
    const [accessToken, setAccessToken] = useState("");
    const [refreshToken, setRefreshToken] = useState();
    const [expiresAt, setExpiresAt] = useState<number>();
    
    useEffect(() => {
        const accessToken = JSON.parse(localStorage.getItem("accessToken")!);
        if (accessToken) {
            setAccessToken(accessToken);
        }

        const refreshToken = JSON.parse(localStorage.getItem("refreshToken")!);
        if (refreshToken) {
            setRefreshToken(refreshToken);
        }

        const expiresAt = JSON.parse(localStorage.getItem("expiresAt")!);
        if (expiresAt) {
            setExpiresAt(expiresAt);
        }

    }, [accessToken, refreshToken, expiresAt])


    useEffect(() => {
        
        if (code !== null) {
            axios.post("http://localhost:5000/auth/login", {
                code, 
            }).then (res => {
                setAccessToken(res.data.accessToken);
                setRefreshToken(res.data.refreshToken);
                setExpiresAt(Date.now() + ((res.data.expiresIn - 60) * 1000));  
                
                localStorage.setItem("accessToken", JSON.stringify(res.data.accessToken));
                localStorage.setItem("refreshToken", JSON.stringify(res.data.refreshToken));
                localStorage.setItem("expiresAt", JSON.stringify(Date.now() + ((res.data.expiresIn - 60) * 1000)));
                window.history.pushState({}, null!, "/");
            }).catch(() => {
                (window as Window).location = "/";
            })
        }
        
    },[code])

    useEffect(() => {
        if (!refreshToken || !expiresAt) return
        const refresh = setTimeout(() => {
          axios
            .post("http://localhost:5000/auth/refresh", {
              refreshToken,
            })
            .then(res => {

              setAccessToken(res.data.accessToken)
              setExpiresAt(Date.now() + ((res.data.expiresIn - 60) * 1000));
              localStorage.setItem("accessToken", JSON.stringify(res.data.accessToken));
              localStorage.setItem("expiresAt", JSON.stringify(Date.now() + ((res.data.expiresIn - 60) * 1000)));

              if (res.data.refreshToken) {
                setRefreshToken(res.data.refreshToken);
              localStorage.setItem("refreshToken", JSON.stringify(res.data.refreshToken));
              }
              
            })
            .catch(() => {
                (window as Window).location = "/";
            })
        }, expiresAt - Date.now())
    
        return () => clearTimeout(refresh);
      }, [refreshToken, expiresAt])


    return accessToken;
}