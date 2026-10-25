// Endpoints públicos do ambiente independente Looply V3.
// Nunca coloque strings de conexão, chaves S3 ou outros segredos neste arquivo.
window.LOOPLY_CONFIG = Object.freeze({
  backendProvider: "neon",
  neonAuthUrl: "https://ep-fancy-smoke-b7d6t1s6.neonauth.c-13.us-east-1.aws.neon.tech/neondb/auth",
  neonDataApiUrl: "https://ep-fancy-smoke-b7d6t1s6.apirest.c-13.us-east-1.aws.neon.tech/neondb/rest/v1",
  apiBaseUrl: "https://looply-v3-staging.s0upoetamoiss.workers.dev",
  // Add TURN credentials from your TURN provider to improve calls on restrictive networks.
  // Example: { urls: "turns:turn.example.com:5349", username: "short-lived-user", credential: "short-lived-password" }
  rtcIceServers: []
});

