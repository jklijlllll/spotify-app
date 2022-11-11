export interface PlaylistInterface {
  collaborative: boolean;
  description: string | null;
  external_urls: {
    spotify: string;
  };
  followers: {
    href: string;
    total: number;
  };
  href: string;
  id: string;
  images: {
    url: string;
    height: number | null;
    width: number | null;
  }[];
  name: string;
  owner: {
    external_urls: {
      spotify: string;
    };
    followers: {
      href: string;
      total: number;
    };
    href: string;
    id: string;
    type: string;
    uri: string;
    display_name: string;
  };
  public: boolean;
  snapshot_id: boolean;
  tracks: {
    href: string;
    items: any[];
    limit: number;
    next: string;
    offset: number;
    previous: string;
    total: number;
  };
  type: string;
  uri: string;
}

export interface ArtistInterface {
  external_urls: { spotify: string };
  followers: { href: string; total: number };
  genres: string[];
  href: string;
  id: string;
  images: {
    url: string;
    release_date: string;
    release_date_precision: string;
  }[];
  name: string;
  popularity: number;
  type: string;
  uri: string;
}

interface AlbumInterface {
  album_type: string;
  total_tracks: number;
  available_markets: string[];
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  images: {
    url: string;
    release_date: string;
    release_date_precision: string;
  }[];
  restrictions: {
    reason: string;
  };
  type: "album";
  uri: string;
  album_group: "album" | "single" | "compilation" | "appears_on";
  artists: ArtistInterface[];
}

interface LinkInterface {
  album: AlbumInterface;
  artists: ArtistInterface[];
  available_markets: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids: {
    isrc: string;
    ean: string;
    upc: string;
  };
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  is_playable: boolean;
  restrictions: {
    reason: string;
  };
  linked_from?: LinkInterface;
  name: string;
  popularity: number;
  preview_url: string;
  track_number: number;
  type: string;
  uri: string;
  is_local: boolean;
}

export interface TrackInterface {
  album: AlbumInterface;
  artists: ArtistInterface[];
  available_markets: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids: {
    isrc: string;
    ean: string;
    upc: string;
  };
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  is_playable: boolean;
  linked_from: LinkInterface;
  restrictions: {
    reason: string;
  };
  name: string;
  popularity: number;
  preview_url: string;
  track_number: number;
  type: "track";
  uri: string;
  is_local: boolean;
  audio_features?: AudioFeatures;
}

export interface UserInterface {
  country: string;
  display_name: string;
  email: string;
  explicit_content: {
    filter_enabled: boolean;
    filter_locked: boolean;
  };
  external_urls: {
    spotify: string;
  };
  followers: {
    href: string;
    total: number;
  };
  href: string;
  id: string;
  images: {
    url: string;
    height: number;
    width: number;
  }[];
  product: string;
  type: "user";
  uri: string;
}

export interface DeviceInterface {
  id: string;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: string;
  volume_percent: number;
}

export interface WebPlaybackState {
  context: {
    uri: string | null;
    metadata: any;
  };
  disallows: {
    pausing: boolean | undefined;
    peeking_next: boolean | undefined;
    peeking_prev: boolean | undefined;
    resuming: boolean | undefined;
    seeking: boolean | undefined;
    skipping_next: boolean | undefined;
    skipping_prev: boolean | undefined;
  };
  duration: number;
  loading: boolean;
  paused: boolean;
  position: number;
  repeat_mode: number;
  shuffle: boolean;
  timestamp: number;
  track_window: {
    current_track: TrackInterface;
    previous_tracks: TrackInterface[];
    next_tracks: TrackInterface[];
  };
}

export interface AudioFeatures {
  [index: string]: number | string;
  acousticness: number;
  analysis_url: string;
  danceability: number;
  duration_ms: number;
  energy: number;
  id: string;
  instrumentalness: number;
  key: number;
  liveness: number;
  loudness: number;
  mode: number;
  speechiness: number;
  tempo: number;
  time_signature: number;
  track_href: string;
  type: string;
  uri: string;
  valence: number;
}
