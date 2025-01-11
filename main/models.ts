
interface Profile {
    id: string;
    name: string;
    credentials: Array<Credential>
  }

  interface Credential {
    id: string,
    platform: string,
    apiKey?: string,
    secret?: string,
    username?: string,
    password?: string,
    additionalSettings?: Record<string, any>
  }
  
  export interface AppData {
    profiles: Profile[];
  }